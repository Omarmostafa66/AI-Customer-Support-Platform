import { Component, inject } from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,

  imports: [
    RouterLink,
    RouterLinkActive,
  ],

  styleUrl: '../sidebar/sidebar.css',

  template: `
    <aside class="sidebar">

      <!-- =========================
           Brand
      ========================== -->

      <div class="brand">

        @if (auth.avatar()) {

          <img
            class="brand-avatar"
            [src]="auth.avatar()!"
            alt="Account profile"
          />

        } @else {

          <span
            class="brand-mark"
            aria-hidden="true"
          >
            ✳
          </span>

        }

        <div>
          <h2>AI Customer Support</h2>
          <p>Management workspace</p>
        </div>

      </div>


      <!-- =========================
           Workspace Navigation
      ========================== -->

      <p class="nav-label">
        WORKSPACE
      </p>


      <nav
        class="nav-links"
        aria-label="Admin navigation"
      >

        <!-- Dashboard -->

        <a
          routerLink="/dashboard"
          routerLinkActive="active"
          ariaCurrentWhenActive="page"
        >
          <span
            class="nav-icon"
            aria-hidden="true"
          >
            ▦
          </span>

          <span>
            Dashboard
          </span>
        </a>


        <!-- Tickets -->

        <a
          routerLink="/tickets"
          routerLinkActive="active"
          ariaCurrentWhenActive="page"
        >
          <span
            class="nav-icon"
            aria-hidden="true"
          >
            ▤
          </span>

          <span>
            Tickets
          </span>
        </a>


        <!-- Customers -->

        <a
          routerLink="/customers"
          routerLinkActive="active"
          ariaCurrentWhenActive="page"
        >
          <span
            class="nav-icon"
            aria-hidden="true"
          >
            ◉
          </span>

          <span>
            Customers
          </span>
        </a>


        <!-- Incidents -->

        <a
          routerLink="/incidents"
          routerLinkActive="active"
          ariaCurrentWhenActive="page"
        >
          <span
            class="nav-icon"
            aria-hidden="true"
          >
            ◇
          </span>

          <span>
            Incidents
          </span>
        </a>


        <!-- Messages -->

        <a
          routerLink="/messages"
          routerLinkActive="active"
          ariaCurrentWhenActive="page"
        >
          <span
            class="nav-icon"
            aria-hidden="true"
          >
            ▱
          </span>

          <span>
            Messages
          </span>
        </a>


        <!-- Categories -->

        <a
          routerLink="/categories"
          routerLinkActive="active"
          ariaCurrentWhenActive="page"
        >
          <span
            class="nav-icon"
            aria-hidden="true"
          >
            ⊞
          </span>

          <span>
            Categories
          </span>
        </a>


        <!-- Employees -->

        <a
          routerLink="/employees"
          routerLinkActive="active"
          ariaCurrentWhenActive="page"
        >
          <span
            class="nav-icon"
            aria-hidden="true"
          >
            ♙
          </span>

          <span>
            Employees
          </span>
        </a>


        <!-- =========================
             My Account
        ========================== -->

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

          <span>
            My Account
          </span>
        </a>

      </nav>


      <!-- =========================
           Sidebar Footer
      ========================== -->

      <div class="sidebar-footer">

        <div class="workspace-label">

          <strong>
            Admin Portal
          </strong>

          <p>
            Manage the people and processes behind your support.
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

          <span>
            Logout
          </span>

        </button>

      </div>

    </aside>
  `,
})
export class Sidebar {

  private readonly router =
    inject(Router);

  readonly auth =
    inject(AuthService);

  private readonly toastService =
    inject(ToastService);


  logout(): void {

    this.toastService.info(
      'You have been signed out of the management workspace.',
      'Signed out'
    );

    this.auth.logout();

    void this.router.navigateByUrl(
      '/login'
    );
  }
}
