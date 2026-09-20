import {
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';

import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import {
  filter,
  map,
  startWith,
} from 'rxjs';

import { toSignal } from '@angular/core/rxjs-interop';

import { Api } from '../../services/api';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-customer-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './customer-header.html',
  styleUrl: './customer-header.css',
})
export class CustomerHeader
  implements OnInit, OnDestroy {

  private readonly router =
    inject(Router);

  readonly auth =
    inject(AuthService);

  private readonly api =
    inject(Api);

  private readonly toastService =
    inject(ToastService);


  // =========================
  // Current Route
  // =========================

  readonly path = toSignal(
    this.router.events.pipe(
      filter(
        (event) =>
          event instanceof NavigationEnd
      ),

      map(
        (event) =>
          event.urlAfterRedirects
            .split(/[?#]/)[0]
      ),

      startWith(
        this.router.url
          .split(/[?#]/)[0]
      ),
    ),
  );


  // =========================
  // Avatar
  // =========================

  avatarSource: string | null = null;


  // =========================
  // Lifecycle
  // =========================

  ngOnInit(): void {
    this.loadAvatar();
  }


  ngOnDestroy(): void {
    this.revokeAvatarUrl();
  }


  // =========================
  // Load Avatar
  // =========================

  private loadAvatar(): void {

    this.api.getMyAccount().subscribe({

      next: (account) => {

        if (!account.hasAvatar) {

          this.avatarSource = null;

          return;
        }

        this.api.getAvatar().subscribe({

          next: (blob) => {

            this.revokeAvatarUrl();

            this.avatarSource =
              URL.createObjectURL(blob);
          },

          error: () => {

            this.revokeAvatarUrl();

            this.avatarSource = null;
          },

        });
      },

      error: () => {

        this.avatarSource = null;
      },

    });
  }


  // =========================
  // Initials
  // =========================

  get initials(): string {

    const name =
      this.auth.getUser()?.email ||
      'Customer';

    const parts =
      name
        .split('@')[0]
        .split(/[._\-\s]+/)
        .filter(Boolean);

    if (parts.length === 0) {
      return 'CU';
    }

    if (parts.length === 1) {

      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[1].charAt(0)
    ).toUpperCase();
  }


  // =========================
  // Tickets Navigation
  // =========================

  ticketsActive(): boolean {

    const path =
      this.path() ?? '';

    return (
      path === '/customer/tickets' ||
      (
        path.startsWith(
          '/customer/tickets/'
        ) &&
        path !==
          '/customer/tickets/new'
      )
    );
  }


  // =========================
  // Revoke Avatar URL
  // =========================

  private revokeAvatarUrl(): void {

    if (this.avatarSource) {

      URL.revokeObjectURL(
        this.avatarSource
      );

      this.avatarSource = null;
    }
  }


  // =========================
  // Logout
  // =========================

  logout(): void {

    this.revokeAvatarUrl();

    this.toastService.info(
      'You have been signed out of your customer account.',
      'Signed out'
    );

    this.auth.logout();

    void this.router.navigateByUrl(
      '/login'
    );
  }
}
