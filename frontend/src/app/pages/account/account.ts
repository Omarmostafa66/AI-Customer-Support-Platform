import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';

import {
  DecimalPipe,
  NgClass,
} from '@angular/common';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Api } from '../../services/api';
import { AuthService } from '../../services/auth.service';
import { AccountAvatarService } from '../../services/account-avatar.service';

import {
  Account,
  ChangePasswordRequest,
  UpdateAccountRequest,
} from '../../models/resources';

import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    DecimalPipe,
  ],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class AccountPage
  implements OnInit, OnDestroy
{
  private readonly api = inject(Api);
  private readonly toast = inject(ToastService);
  private readonly cdr =
    inject(ChangeDetectorRef);
  private readonly router =
    inject(Router);
  private readonly auth =
    inject(AuthService);
  private readonly avatarService =
    inject(AccountAvatarService);

  // =========================
  // Account state
  // =========================

  account: Account | null = null;

  loading = true;
  editingProfile = false;
  savingProfile = false;
  changingPassword = false;
  avatarUploading = false;

  // =========================
  // Avatar state
  // =========================

  avatarSource: string | null = null;
  avatarPreview: string | null = null;

  private selectedAvatarFile: File | null =
    null;

  private avatarObjectUrl: string | null =
    null;

  // =========================
  // Photo Viewer
  // =========================

  photoActionVisible = false;
  photoModalOpen = false;

  // =========================
  // Password visibility
  // =========================

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // =========================
  // Profile form
  // =========================

  profileForm: UpdateAccountRequest = {
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    gender: '',
    age: 0,
  };

  // =========================
  // Password form
  // =========================

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  // =========================
  // Lifecycle
  // =========================

  ngOnInit(): void {
    this.loadAccount();
  }

  ngOnDestroy(): void {
    this.closePhoto();

    this.revokeAvatarObjectUrl();
    this.revokeAvatarImageUrl();
  }

  // =========================
  // Navigation
  // =========================

  goBack(): void {
    if (this.auth.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    if (this.auth.isEmployee()) {
      this.router.navigate([
        '/employee/dashboard',
      ]);
      return;
    }

    if (this.auth.isCustomer()) {
      this.router.navigate([
        '/customer/dashboard',
      ]);
      return;
    }

    /*
     * Safety fallback.
     *
     * If there is no valid authenticated role,
     * go to login instead of leaving the user
     * on an invalid route.
     */
    this.router.navigate(['/login']);
  }

  // =========================
  // Load Account
  // =========================

  loadAccount(): void {
    this.loading = true;

    this.api.getMyAccount().subscribe({
      next: (account) => {
        console.log(
          'ACCOUNT RESPONSE:',
          account,
        );

        this.account = account;

        this.syncProfileForm();

        this.loadAvatar();

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error(
          'ACCOUNT LOAD ERROR:',
          error,
        );

        this.loading = false;

        const message =
          error?.error?.message ||
          'Unable to load your account information.';

        this.toast.error(message);

        this.cdr.detectChanges();
      },
    });
  }

  // =========================
  // Avatar
  // =========================

  loadAvatar(): void {
    if (!this.account?.hasAvatar) {
      this.revokeAvatarImageUrl();

      this.avatarSource = null;

      this.photoActionVisible = false;
      this.photoModalOpen = false;

      this.cdr.detectChanges();

      return;
    }

    /*
     * Do NOT use:
     *
     * <img src="http://localhost:8080/account/me/avatar">
     *
     * directly.
     *
     * Instead, request the image through Angular
     * HttpClient so auth.interceptor.ts attaches
     * the JWT Authorization header.
     */
    this.api.getAvatar().subscribe({
      next: (blob) => {
        /*
         * Remove the previous object URL first
         * to avoid memory leaks.
         */
        this.revokeAvatarImageUrl();

        /*
         * Create a browser-local URL for the
         * authenticated image response.
         */
        this.avatarSource =
          URL.createObjectURL(blob);

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error(
          'AVATAR LOAD ERROR:',
          error,
        );

        this.revokeAvatarImageUrl();

        this.avatarSource = null;

        this.photoActionVisible = false;
        this.photoModalOpen = false;

        this.cdr.detectChanges();
      },
    });
  }

  onAvatarSelected(
    event: Event,
  ): void {
    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (
      !allowedTypes.includes(
        file.type,
      )
    ) {
      this.toast.error(
        'Please select a JPG, PNG, or WEBP image.',
      );

      input.value = '';

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      this.toast.error(
        'Profile image must be smaller than 5 MB.',
      );

      input.value = '';

      return;
    }

    /*
     * Store the selected file until
     * the user clicks Upload Photo.
     */
    this.selectedAvatarFile = file;

    /*
     * Remove previous temporary preview URL.
     */
    this.revokeAvatarObjectUrl();

    /*
     * Create a local preview immediately.
     */
    this.avatarObjectUrl =
      URL.createObjectURL(file);

    this.avatarPreview =
      this.avatarObjectUrl;

    this.photoActionVisible = false;
    this.photoModalOpen = false;

    this.cdr.detectChanges();
  }

  uploadAvatar(): void {
    if (
      !this.selectedAvatarFile ||
      this.avatarUploading
    ) {
      return;
    }

    this.avatarUploading = true;

    this.api
      .uploadAvatar(
        this.selectedAvatarFile,
      )
      .subscribe({
        next: () => {
          this.avatarUploading = false;

          /*
           * Remove the selected file.
           */
          this.selectedAvatarFile = null;

          /*
           * Remove temporary preview.
           */
          this.avatarPreview = null;

          this.photoActionVisible = false;
          this.photoModalOpen = false;

          this.revokeAvatarObjectUrl();

          /*
           * Tell the account page that the
           * current account now has an avatar.
           */
          if (this.account) {
            this.account = {
              ...this.account,
              hasAvatar: true,
            };
          }

          /*
           * Load the actual image again through
           * authenticated HttpClient request.
           */
          this.loadAvatar();

          this.avatarService.refresh();

          this.toast.success(
            'Profile photo updated successfully.',
          );

          this.cdr.detectChanges();
        },

        error: (error) => {
          this.avatarUploading = false;

          console.error(
            'AVATAR UPLOAD ERROR:',
            error,
          );

          const message =
            error?.error?.message ||
            'Unable to upload your profile photo.';

          this.toast.error(message);

          this.cdr.detectChanges();
        },
      });
  }

  cancelAvatarSelection(): void {
    this.selectedAvatarFile = null;

    this.avatarPreview = null;

    this.photoActionVisible = false;
    this.photoModalOpen = false;

    this.revokeAvatarObjectUrl();

    this.cdr.detectChanges();
  }

  removeAvatar(): void {
    if (
      !this.account?.hasAvatar ||
      this.avatarUploading
    ) {
      return;
    }

    this.avatarUploading = true;

    this.api.deleteAvatar().subscribe({
      next: () => {
        this.avatarUploading = false;

        /*
         * Remove displayed image.
         */
        this.revokeAvatarImageUrl();

        this.avatarService.clear();

        /*
         * Close photo viewer if open.
         */
        this.photoActionVisible = false;
        this.photoModalOpen = false;

        /*
         * Remove temporary selection.
         */
        this.avatarPreview = null;

        this.selectedAvatarFile = null;

        this.revokeAvatarObjectUrl();

        /*
         * Update local account state.
         */
        if (this.account) {
          this.account = {
            ...this.account,
            hasAvatar: false,
          };
        }

        this.toast.success(
          'Profile photo removed successfully.',
        );

        this.cdr.detectChanges();
      },

      error: (error) => {
        this.avatarUploading = false;

        console.error(
          'AVATAR DELETE ERROR:',
          error,
        );

        const message =
          error?.error?.message ||
          'Unable to remove your profile photo.';

        this.toast.error(message);

        this.cdr.detectChanges();
      },
    });
  }

  // =========================
  // Photo Viewer
  // =========================

  togglePhotoAction(): void {
    if (
      !this.avatarSource &&
      !this.avatarPreview
    ) {
      return;
    }

    this.photoActionVisible =
      !this.photoActionVisible;

    this.cdr.detectChanges();
  }

  openPhoto(): void {
    const photo =
      this.avatarPreview ||
      this.avatarSource;

    if (!photo) {
      return;
    }

    this.photoModalOpen = true;
    this.photoActionVisible = false;

    this.cdr.detectChanges();
  }

  closePhoto(): void {
    this.photoModalOpen = false;
  }

  onPhotoOverlayClick(
    event: MouseEvent,
  ): void {
    if (
      event.target ===
      event.currentTarget
    ) {
      this.closePhoto();
    }
  }

  @HostListener(
    'document:keydown.escape',
  )
  onEscapeKey(): void {
    if (this.photoModalOpen) {
      this.closePhoto();
    }
  }

  // =========================
  // Avatar Object URLs
  // =========================

  private revokeAvatarObjectUrl(): void {
    if (this.avatarObjectUrl) {
      URL.revokeObjectURL(
        this.avatarObjectUrl,
      );

      this.avatarObjectUrl = null;
    }
  }

  private revokeAvatarImageUrl(): void {
    if (this.avatarSource) {
      /*
       * avatarSource is created by
       * URL.createObjectURL(blob), so it must
       * be revoked when replaced/destroyed.
       */
      URL.revokeObjectURL(
        this.avatarSource,
      );

      this.avatarSource = null;
    }
  }

  // =========================
  // Profile Editing
  // =========================

  startEditing(): void {
    if (!this.account) {
      return;
    }

    this.syncProfileForm();

    this.editingProfile = true;

    this.cdr.detectChanges();
  }

  cancelEditing(): void {
    this.syncProfileForm();

    this.editingProfile = false;

    this.cdr.detectChanges();
  }

  private syncProfileForm(): void {
    if (!this.account) {
      return;
    }

    this.profileForm = {
      name:
        this.account.name || '',

      email:
        this.account.email || '',

      phoneNumber:
        this.account.phoneNumber || '',

      address:
        this.account.address || '',

      gender:
        this.account.gender || '',

      age:
        this.account.age || 0,
    };
  }

  saveProfile(): void {
    if (
      !this.account ||
      this.savingProfile
    ) {
      return;
    }

    const name =
      this.profileForm.name.trim();

    const email =
      this.profileForm.email.trim();

    const phoneNumber =
      (
        this.profileForm
          .phoneNumber || ''
      ).trim();

    const address =
      (
        this.profileForm.address || ''
      ).trim();

    const gender =
      this.profileForm.gender.trim();

    const age =
      Number(
        this.profileForm.age,
      );

    if (!name) {
      this.toast.error(
        'Please enter your full name.',
      );

      return;
    }

    if (!email) {
      this.toast.error(
        'Please enter your email address.',
      );

      return;
    }

    if (
      !this.isValidEmail(email)
    ) {
      this.toast.error(
        'Please enter a valid email address.',
      );

      return;
    }

    if (!gender) {
      this.toast.error(
        'Please select your gender.',
      );

      return;
    }

    if (
      !age ||
      age < 1 ||
      age > 120
    ) {
      this.toast.error(
        'Please enter a valid age.',
      );

      return;
    }

    this.savingProfile = true;

    const body: UpdateAccountRequest = {
      name,
      email,
      phoneNumber,
      address,
      gender,
      age,
    };

    this.api
      .updateMyAccount(body)
      .subscribe({
        next: (
          updatedAccount,
        ) => {
          this.account =
            updatedAccount;

          this.syncProfileForm();

          this.editingProfile = false;

          this.savingProfile = false;

          this.toast.success(
            'Profile updated successfully.',
          );

          /*
           * Reload avatar in case the
           * account response changed.
           */
          this.loadAvatar();

          this.cdr.detectChanges();
        },

        error: (error) => {
          this.savingProfile = false;

          console.error(
            'PROFILE UPDATE ERROR:',
            error,
          );

          const message =
            error?.error?.message ||
            'Unable to update your profile.';

          this.toast.error(message);

          this.cdr.detectChanges();
        },
      });
  }

  private isValidEmail(
    email: string,
  ): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    );
  }

  // =========================
  // Change Password
  // =========================

  changePassword(): void {
    const currentPassword =
      this.passwordForm
        .currentPassword;

    const newPassword =
      this.passwordForm
        .newPassword;

    const confirmPassword =
      this.passwordForm
        .confirmPassword;

    if (!currentPassword) {
      this.toast.error(
        'Please enter your current password.',
      );

      return;
    }

    if (!newPassword) {
      this.toast.error(
        'Please enter a new password.',
      );

      return;
    }

    if (
      newPassword.length < 6
    ) {
      this.toast.error(
        'New password must be at least 6 characters.',
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      this.toast.error(
        'New password and confirmation do not match.',
      );

      return;
    }

    if (
      currentPassword ===
      newPassword
    ) {
      this.toast.error(
        'New password must be different from your current password.',
      );

      return;
    }

    if (this.changingPassword) {
      return;
    }

    this.changingPassword = true;

    const body: ChangePasswordRequest = {
      currentPassword,
      newPassword,
    };

    this.api
      .changePassword(body)
      .subscribe({
        next: (response) => {
          this.changingPassword =
            false;

          this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          };

          this.showCurrentPassword =
            false;

          this.showNewPassword =
            false;

          this.showConfirmPassword =
            false;

          this.toast.success(
            response?.message ||
              'Password changed successfully.',
          );

          this.cdr.detectChanges();
        },

        error: (error) => {
          this.changingPassword =
            false;

          console.error(
            'PASSWORD CHANGE ERROR:',
            error,
          );

          const message =
            error?.error?.message ||
            'Unable to change your password.';

          this.toast.error(message);

          this.cdr.detectChanges();
        },
      });
  }

  // =========================
  // Display Helpers
  // =========================

  get displayName(): string {
    return (
      this.account?.name ||
      this.account?.email ||
      'User'
    );
  }

  get initials(): string {
    const name =
      this.account?.name?.trim();

    if (!name) {
      return 'U';
    }

    const parts = name
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[
        parts.length - 1
      ].charAt(0)
    ).toUpperCase();
  }

  get roleLabel(): string {
    switch (
      this.account?.role
    ) {
      case 'ADMIN':
        return 'Administrator';

      case 'EMPLOYEE':
        return 'Employee';

      case 'CUSTOMER':
        return 'Customer';

      default:
        return 'User';
    }
  }

  get employeeRoleLabel(): string {
    const role =
      this.account?.employeeRole;

    if (!role) {
      return '';
    }

    return role
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(
        /\b\w/g,
        (char) =>
          char.toUpperCase(),
      );
  }

  get roleBadgeClass(): string {
    switch (
      this.account?.role
    ) {
      case 'ADMIN':
        return 'role-admin';

      case 'EMPLOYEE':
        return 'role-employee';

      case 'CUSTOMER':
        return 'role-customer';

      default:
        return 'role-default';
    }
  }
}
