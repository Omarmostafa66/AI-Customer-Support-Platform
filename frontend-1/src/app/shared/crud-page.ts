import {
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import { apiError } from './api-error';
import { ToastService } from './toast/toast.service';
import { ConfirmDialogService } from './confirm-dialog/confirm-dialog.service';

// Shared request lifecycle; each page owns its fields and exact API calls.
@Directive()
export abstract class CrudPage<T extends { id: number }> implements OnInit {
  protected readonly cdr = inject(ChangeDetectorRef);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly toastService = inject(ToastService);
  protected readonly confirmDialog = inject(ConfirmDialogService);

  records: T[] = [];
  loading = false;
  busy = false;
  loaded = false;

  error = '';
  notice = '';

  showForm = false;
  editingId: number | null = null;

  abstract fetchRecords(): Observable<T[]>;
  abstract removeRecord(id: number): Observable<void>;
  abstract resetForm(): void;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    if (this.loading || this.busy) return;

    this.loading = true;
    this.error = '';

    this.fetchRecords()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (records) => {
          this.records = records;
          this.loaded = true;
          this.loading = false;

          this.cdr.markForCheck();
        },

        error: (error) => {
          const message = apiError(
            error,
            'Could not load records.',
          );

          this.error = message;
          this.loading = false;
          this.loaded = false;

          this.toastService.error(
            message,
            'Could not load records',
          );

          this.cdr.markForCheck();
        },
      });
  }

  openCreateForm(): void {
    if (this.busy) return;

    this.resetForm();
    this.editingId = null;
    this.showForm = true;

    this.error = '';
    this.notice = '';
  }

  cancelForm(): void {
    if (this.busy) return;

    this.showForm = false;
    this.editingId = null;

    this.resetForm();
  }

  saveRequest(request: Observable<T>): void {
    if (this.busy) return;

    this.busy = true;
    this.error = '';
    this.notice = '';

    request
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busy = false;

          this.cancelForm();

          this.notice = 'Changes saved.';

          this.toastService.success(
            'Your changes have been saved successfully.',
            'Changes saved',
          );

          this.load();
          this.cdr.markForCheck();
        },

        error: (error) => {
          this.busy = false;

          const message = apiError(
            error,
            'Could not save changes.',
          );

          this.error = message;

          this.toastService.error(
            message,
            'Could not save changes',
          );

          this.cdr.markForCheck();
        },
      });
  }

  async deleteRecord(record: T): Promise<void> {
    if (this.busy) {
      return;
    }

    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete record?',
      message:
        `Are you sure you want to delete record #${record.id}? ` +
        'This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true,
    });

    if (!confirmed || this.busy) {
      return;
    }

    this.busy = true;
    this.error = '';
    this.notice = '';

    this.confirmDialog.setLoading(true);

    this.removeRecord(record.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busy = false;
          this.confirmDialog.setLoading(false);

          if (this.editingId === record.id) {
            this.cancelForm();
          }

          this.notice = 'Record deleted.';

          this.toastService.success(
            `Record #${record.id} was deleted successfully.`,
            'Record deleted',
          );

          this.load();
          this.cdr.markForCheck();
        },

        error: (error) => {
          this.busy = false;
          this.confirmDialog.setLoading(false);

          const message = apiError(
            error,
            'Could not delete record.',
          );

          this.error = message;

          this.toastService.error(
            message,
            'Could not delete record',
          );

          this.cdr.markForCheck();
        },
      });
  }
}
