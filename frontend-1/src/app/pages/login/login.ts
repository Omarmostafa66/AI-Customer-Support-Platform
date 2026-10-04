import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';

  loading = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.loading) {
      return;
    }

    this.errorMessage = '';

    const email = this.email.trim();

    if (!email || !this.password) {
      this.errorMessage =
        'Please enter your email and password.';

      this.toastService.warning(
        'Please enter your email and password.',
        'Missing information',
      );

      return;
    }

    if (!this.isValidEmail(email)) {
      this.errorMessage =
        'Please enter a valid email address.';

      this.toastService.warning(
        'Please enter a valid email address.',
        'Invalid email',
      );

      return;
    }

    this.loading = true;

    // Make sure the UI immediately reflects the loading state.
    this.cdr.detectChanges();

    this.authService
      .login(email, this.password)
      .pipe(
        finalize(() => {
          this.loading = false;

          // Force the UI to unlock the form after
          // success, 400, 401, 500, network error, etc.
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response) => {
          this.toastService.success(
            'You have successfully signed in.',
            'Welcome back',
          );

          if (response.role === 'CUSTOMER') {
            void this.router.navigate([
              '/customer/dashboard',
            ]);
            return;
          }

          if (response.role === 'EMPLOYEE') {
            void this.router.navigate([
              '/employee/dashboard',
            ]);
            return;
          }

          void this.router.navigate(['/dashboard']);
        },

        error: (error) => {
          // Explicitly unlock the form immediately.
          this.loading = false;
          this.cdr.detectChanges();

          if (error.status === 401) {
            this.errorMessage =
              'Invalid email or password.';

            this.toastService.error(
              'Please check your email and password and try again.',
              'Login failed',
            );

            return;
          }

          if (error.status === 400) {
            const message =
              error.error?.message ||
              'Invalid login information.';

            this.errorMessage = message;

            this.toastService.error(
              message,
              'Invalid login information',
            );

            return;
          }

          this.errorMessage =
            'Unable to connect to the server. Please try again.';

          this.toastService.error(
            'Unable to connect to the server. Please try again.',
            'Connection error',
          );
        },
      });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
