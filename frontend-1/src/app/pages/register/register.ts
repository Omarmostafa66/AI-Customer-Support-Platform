import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  name = '';
  email = '';
  phoneNumber = '';
  address = '';
  gender = '';
  age: number | null = null;
  password = '';
  confirmPassword = '';

  loading = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.loading) {
      return;
    }

    this.errorMessage = '';

    const name = this.name.trim();
    const email = this.email.trim();
    const phoneNumber = this.phoneNumber.trim();
    const address = this.address.trim();
    const gender = this.gender.trim();

    if (
      !name ||
      !email ||
      !phoneNumber ||
      !address ||
      !gender ||
      this.age === null ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.showWarning(
        'Please complete all required fields before creating your account.',
        'Missing information',
      );

      return;
    }

    if (!this.isValidEmail(email)) {
      this.showWarning(
        'Please enter a valid email address.',
        'Invalid email',
      );

      return;
    }

    if (
      this.age < 0 ||
      !Number.isInteger(this.age)
    ) {
      this.showWarning(
        'Please enter a valid whole number for age.',
        'Invalid age',
      );

      return;
    }

    if (this.password.length < 6) {
      this.showWarning(
        'Your password must contain at least 6 characters.',
        'Weak password',
      );

      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showWarning(
        'The passwords you entered do not match.',
        'Passwords do not match',
      );

      return;
    }

    this.loading = true;

    this.authService
      .register(
        name,
        email,
        this.password,
        phoneNumber,
        address,
        gender,
        this.age,
      )
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            'Your customer account has been created successfully.',
            'Account created',
          );

          void this.router.navigate(['/customer/dashboard']);
        },

        error: (error) => {
          if (error.status === 400) {
            const message =
              error.error?.message ||
              'Unable to create the account. Please check your information.';

            this.errorMessage = message;

            this.toastService.error(
              message,
              'Registration failed',
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

  private showWarning(message: string, title: string): void {
    this.errorMessage = message;

    this.toastService.warning(
      message,
      title,
    );
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
