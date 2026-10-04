import { ChangeDetectorRef, DestroyRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subscription } from 'rxjs';

import { Api } from '../services/api';
import { AuthService } from '../services/auth.service';

import { apiError } from './api-error';

@Directive()
export abstract class PortalPage {
  readonly user = inject(AuthService);

  protected readonly api = inject(Api);
  protected readonly cdr = inject(ChangeDetectorRef);
  protected readonly destroyRef = inject(DestroyRef);

  loading = false;
  busy = false;
  error = '';
  notice = '';

  private read?: Subscription;
  private write?: Subscription;

  protected resetRequests(): void {
    this.read?.unsubscribe();
    this.write?.unsubscribe();

    this.loading = false;
    this.busy = false;
    this.error = '';
    this.notice = '';
  }

  protected loadData<T>(
    request: Observable<T>,
    accept: (value: T) => void,
  ): void {
    this.read?.unsubscribe();

    this.loading = true;
    this.error = '';

    this.read = request
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (value) => {
          this.loading = false;

          accept(value);

          this.cdr.markForCheck();
        },

        error: (error) => {
          this.loading = false;

          this.error = apiError(
            error,
            'Could not load data.',
          );

          this.cdr.markForCheck();
        },
      });
  }

  protected submit<T>(
    request: Observable<T>,
    accept: (value: T) => void,
  ): void {
    if (this.busy) return;

    this.busy = true;
    this.error = '';
    this.notice = '';

    this.write = request
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (value) => {
          this.busy = false;

          accept(value);

          this.cdr.markForCheck();
        },

        error: (error) => {
          this.busy = false;

          this.error = apiError(
            error,
            'Could not complete the request.',
          );

          this.cdr.markForCheck();
        },
      });
  }
}
