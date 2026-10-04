import {
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';
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
  timeout,
} from 'rxjs';

import { toSignal } from '@angular/core/rxjs-interop';

import { Api } from '../../services/api';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/toast/toast.service';

import {
  Notification,
} from '../../models/resources';

@Component({
  selector: 'app-customer-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    DatePipe,
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
  // Notifications
  // =========================

  notifications: Notification[] = [];

  unreadNotificationCount = 0;

  notificationPanelOpen = false;

  notificationsLoading = false;

  notificationError = '';


  // =========================
  // Lifecycle
  // =========================

  ngOnInit(): void {
    this.loadAvatar();
    this.loadUnreadNotificationCount();
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
  // Notifications
  // =========================

  private loadNotifications(): void {

    this.notificationsLoading = true;
    this.notificationError = '';

    this.api
      .getNotifications()
      .pipe(
        timeout(10000),
      )
      .subscribe({

        next: (notifications) => {

          this.notifications =
            Array.isArray(notifications)
              ? notifications
              : [];

          this.notificationsLoading = false;
        },

        error: (error) => {

          console.error(
            'Failed to load notifications:',
            error
          );

          this.notifications = [];

          this.notificationsLoading = false;

          this.notificationError =
            'Unable to load notifications.';
        },

      });
  }


  // =========================
  // Load Unread Count
  // =========================

  private loadUnreadNotificationCount(): void {

    this.api
      .getUnreadNotificationCount()
      .subscribe({

        next: (count) => {

          this.unreadNotificationCount =
            Number(count) || 0;
        },

        error: (error) => {

          console.error(
            'Failed to load unread notification count:',
            error
          );

          this.unreadNotificationCount = 0;
        },

      });
  }


  // =========================
  // Toggle Notifications
  // =========================

  toggleNotificationPanel(): void {

    this.notificationPanelOpen =
      !this.notificationPanelOpen;

    if (this.notificationPanelOpen) {

      this.loadNotifications();
      this.loadUnreadNotificationCount();
    }
  }


  // =========================
  // Close Notifications
  // =========================

  closeNotificationPanel(): void {

    this.notificationPanelOpen = false;
  }


  // =========================
  // Mark Notification As Read
  // =========================

  markNotificationAsRead(
    notification: Notification,
  ): void {

    if (
      !notification ||
      notification.read
    ) {
      return;
    }

    this.api
      .markNotificationAsRead(
        notification.id
      )
      .subscribe({

        next: (updatedNotification) => {

          const index =
            this.notifications.findIndex(
              item =>
                item.id ===
                notification.id
            );

          if (index !== -1) {

            this.notifications[index] =
              updatedNotification;
          }

          this.unreadNotificationCount =
            Math.max(
              0,
              this.unreadNotificationCount - 1
            );
        },

        error: (error) => {

          console.error(
            'Failed to mark notification as read:',
            error
          );

          this.toastService.error(
            'Unable to mark the notification as read.',
            'Notification'
          );
        },

      });
  }


  // =========================
  // Notification Helpers
  // =========================

  isUnread(
    notification: Notification,
  ): boolean {

    return !notification.read;
  }


  trackNotification(
    _index: number,
    notification: Notification,
  ): number {

    return notification.id;
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
