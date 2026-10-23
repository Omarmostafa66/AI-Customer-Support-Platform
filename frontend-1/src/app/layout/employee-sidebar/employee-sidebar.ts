
import {
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import { Api } from '../../services/api';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-employee-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
  ],
  styleUrl: '../sidebar/workspace-sidebar.css',

  template: `
    <aside class="sidebar">

      <!-- =========================
           NEXA Brand
      ========================== -->

      <div class="brand">

        <a
          class="brand-lockup"
          routerLink="/employee/dashboard"
          aria-label="NEXA Employee Dashboard"
        >
          <img
            class="brand-logo"
            src="/favicon.png"
            alt="NEXA logo"
          />
        </a>

        <div class="brand-content">

          <h2>
            NEXA
          </h2>

          <p>
            AI Customer Support
          </p>

        </div>

      </div>


      <!-- =========================
           Navigation
      ========================== -->

      <p class="nav-label">
        SUPPORT WORKSPACE
      </p>


      <nav
        class="nav-links"
        aria-label="Support Agent Portal"
      >

        <a
          routerLink="/employee/dashboard"
          routerLinkActive="active"
          ariaCurrentWhenActive="page"
        >
          <span
            class="nav-icon"
            aria-hidden="true"
          >
            ▦
          </span>

          Dashboard
        </a>


        <a
          routerLink="/employee/incidents"
          routerLinkActive="active"
          ariaCurrentWhenActive="page"
        >
          <span
            class="nav-icon"
            aria-hidden="true"
          >
            ◇
          </span>

          Assigned Incidents
        </a>


        <a
          routerLink="/employee/tickets"
          routerLinkActive="active"
          ariaCurrentWhenActive="page"
        >
          <span
            class="nav-icon"
            aria-hidden="true"
          >
            ▤
          </span>

          Tickets
        </a>


        <a
          routerLink="/employee/messages"
          routerLinkActive="active"
          ariaCurrentWhenActive="page"
        >
          <span
            class="nav-icon"
            aria-hidden="true"
          >
            ▱
          </span>

          Messages
        </a>


        <a
          routerLink="/account"
          routerLinkActive="active"
          ariaCurrentWhenActive="page"
        >
          <span
            class="nav-icon"
            aria-hidden="true"
          >
            ◉
          </span>

          My Account
        </a>

      </nav>


      <!-- =========================
           Footer
      ========================== -->

      <div class="sidebar-footer">

        <div class="workspace-label">

          <strong>
            Your support workspace
          </strong>

          <p>
            Review tickets and move assigned incidents forward.
          </p>

        </div>


        <!-- Logout -->

        <button
          type="button"
          class="logout-button"
          (click)="logout()"
        >
          <span
            class="logout-icon"
            aria-hidden="true"
          >
            ↪
          </span>

          Logout
        </button>

      </div>

    </aside>
  `,
})
export class EmployeeSidebar
  implements OnInit, OnDestroy {

  private readonly router =
    inject(Router);

  private readonly auth =
    inject(AuthService);

  private readonly api =
    inject(Api);

  private readonly toastService =
    inject(ToastService);


  // =========================
  // Avatar
  // Preserved for account-related functionality
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
  // Preserved
  // =========================

  get initials(): string {

    const name =
      this.auth.getUser()?.email ||
      'Employee';

    const parts =
      name
        .split('@')[0]
        .split(/[._\-\s]+/)
        .filter(Boolean);

    if (parts.length === 0) {
      return 'EM';
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
      'You have been signed out of your support agent account.',
      'Signed out'
    );

    this.auth.logout();

    void this.router.navigateByUrl(
      '/login'
    );
  }
}
