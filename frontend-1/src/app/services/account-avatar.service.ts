import {
  Injectable,
  inject,
  signal,
} from '@angular/core';

import { Api } from './api';

@Injectable({
  providedIn: 'root',
})
export class AccountAvatarService {

  private readonly api =
    inject(Api);


  // =========================================================
  // Shared Avatar State
  // =========================================================

  private readonly avatarUrl =
    signal<string | null>(null);

  private readonly loading =
    signal(false);


  readonly imageUrl =
    this.avatarUrl.asReadonly();

  readonly isLoading =
    this.loading.asReadonly();


  // =========================================================
  // Browser Object URL
  // =========================================================

  private objectUrl:
    string | null = null;


  // =========================================================
  // Load Avatar
  // =========================================================

  load(): void {

    /*
     * Prevent duplicate requests while
     * the avatar is already being loaded.
     */
    if (this.loading()) {
      return;
    }


    /*
     * First ask the backend whether
     * the current authenticated account
     * actually has an avatar.
     */
    this.loading.set(true);

    this.api.getMyAccount().subscribe({

      next: (account) => {

        if (!account.hasAvatar) {

          this.clear();

          return;
        }


        /*
         * Important:
         *
         * We use force = true here because
         * loading is already true.
         */
        this.loadImage(true);
      },


      error: () => {

        this.clear();
      },

    });
  }


  // =========================================================
  // Refresh Avatar
  // =========================================================

  refresh(): void {

    /*
     * Force a fresh request after
     * uploading a new profile photo.
     */
    this.loadImage(true);
  }


  // =========================================================
  // Load Image From Backend
  // =========================================================

  private loadImage(
    force = false,
  ): void {

    /*
     * Do not start another request
     * while one is already running,
     * unless this method was explicitly
     * requested as a forced refresh.
     */
    if (
      this.loading() &&
      !force
    ) {
      return;
    }


    this.loading.set(true);


    this.api.getAvatar().subscribe({

      next: (blob) => {

        /*
         * Remove the old browser Object URL
         * before creating a new one.
         */
        this.revokeObjectUrl();


        /*
         * Convert the Blob returned by
         * the backend into a browser URL.
         */
        this.objectUrl =
          URL.createObjectURL(blob);


        /*
         * Update the shared Signal.
         *
         * Every component using
         * avatarService.imageUrl()
         * will update automatically.
         */
        this.avatarUrl.set(
          this.objectUrl
        );


        this.loading.set(false);
      },


      error: (error) => {

        console.error(
          'ACCOUNT AVATAR LOAD ERROR:',
          error
        );


        /*
         * If the image does not exist
         * or the request fails, make sure
         * the old image is not displayed.
         */
        this.clear();
      },

    });
  }


  // =========================================================
  // Clear Avatar
  // =========================================================

  clear(): void {

    this.revokeObjectUrl();


    this.avatarUrl.set(null);

    this.loading.set(false);
  }


  // =========================================================
  // Revoke Browser Object URL
  // =========================================================

  private revokeObjectUrl(): void {

    if (this.objectUrl) {

      URL.revokeObjectURL(
        this.objectUrl
      );

      this.objectUrl = null;
    }
  }
}
