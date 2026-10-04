import {
  Injectable,
  computed,
  signal,
} from '@angular/core';

import { HttpClient } from '@angular/common/http';

import {
  Observable,
  tap,
  catchError,
  of,
} from 'rxjs';

export type UserRole =
  | 'ADMIN'
  | 'CUSTOMER'
  | 'EMPLOYEE';

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  role: UserRole;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  gender: string;
  age: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly API_URL =
    'http://localhost:8080/auth';

  private readonly ACCOUNT_URL =
    'http://localhost:8080/account';

  private readonly TOKEN_KEY =
    'auth_token';

  private readonly USER_KEY =
    'auth_user';


  // =========================================================
  // Session
  // =========================================================

  private readonly session =
    signal<AuthResponse | null>(
      this.loadStoredUser(),
    );


  // =========================================================
  // Avatar
  // =========================================================

  private readonly avatarSource =
    signal<string | null>(null);

  readonly avatar =
    this.avatarSource.asReadonly();


  // =========================================================
  // User Role
  // =========================================================

  readonly role =
    computed<UserRole | null>(
      () =>
        this.session()?.role ?? null,
    );


  // =========================================================
  // Current Customer ID
  // =========================================================

  readonly currentCustomerId =
    computed<number | null>(() => {

      const user =
        this.session();

      return user?.role === 'CUSTOMER'
        ? user.userId
        : null;
    });


  // =========================================================
  // Current Employee ID
  // =========================================================

  readonly currentEmployeeId =
    computed<number | null>(() => {

      const user =
        this.session();

      return user?.role === 'EMPLOYEE'
        ? user.userId
        : null;
    });


  constructor(
    private readonly http: HttpClient,
  ) {}


  // =========================================================
  // Login
  // =========================================================

  login(
    email: string,
    password: string,
  ): Observable<AuthResponse> {

    const request: LoginRequest = {
      email:
        email
          .trim()
          .toLowerCase(),

      password,
    };


    return this.http
      .post<AuthResponse>(
        `${this.API_URL}/login`,
        request,
      )
      .pipe(

        tap((response) => {

          /*
           * Save JWT and user session first.
           */
          this.saveSession(response);

          /*
           * Clear any old avatar from a previous session.
           */
          this.clearAvatar();

          /*
           * Load the avatar belonging
           * to the newly authenticated user.
           */
          this.loadAvatar();
        }),
      );
  }


  // =========================================================
  // Register
  // =========================================================

  register(
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
    address: string,
    gender: string,
    age: number,
  ): Observable<AuthResponse> {

    const request: RegisterRequest = {

      name:
        name.trim(),

      email:
        email
          .trim()
          .toLowerCase(),

      password,

      phoneNumber:
        phoneNumber.trim(),

      address:
        address.trim(),

      gender:
        gender.trim(),

      age,
    };


    return this.http
      .post<AuthResponse>(
        `${this.API_URL}/register`,
        request,
      )
      .pipe(

        tap((response) => {

          /*
           * Save the newly created session.
           */
          this.saveSession(response);

          /*
           * Make sure no avatar from
           * a previous session remains.
           */
          this.clearAvatar();

          /*
           * Load avatar if the account
           * already has one.
           */
          this.loadAvatar();
        }),
      );
  }


  // =========================================================
  // Logout
  // =========================================================

  logout(): void {

    /*
     * Revoke the browser object URL first.
     */
    this.clearAvatar();


    /*
     * Remove authentication data.
     */
    localStorage.removeItem(
      this.TOKEN_KEY,
    );

    localStorage.removeItem(
      this.USER_KEY,
    );


    /*
     * Clear reactive session.
     */
    this.session.set(null);
  }


  // =========================================================
  // Token
  // =========================================================

  getToken(): string | null {

    return localStorage.getItem(
      this.TOKEN_KEY,
    );
  }


  // =========================================================
  // Current User
  // =========================================================

  getUser(): AuthResponse | null {

    return this.session();
  }


  // =========================================================
  // Login State
  // =========================================================

  isLoggedIn(): boolean {

    return (
      this.session() !== null &&
      this.getToken() !== null
    );
  }


  // =========================================================
  // Role
  // =========================================================

  getRole(): UserRole | null {

    return (
      this.session()?.role ?? null
    );
  }


  // =========================================================
  // User ID
  // =========================================================

  getUserId(): number | null {

    return (
      this.session()?.userId ?? null
    );
  }


  // =========================================================
  // Email
  // =========================================================

  getEmail(): string | null {

    return (
      this.session()?.email ?? null
    );
  }


  // =========================================================
  // Role Helpers
  // =========================================================

  isAdmin(): boolean {

    return this.getRole() === 'ADMIN';
  }


  isCustomer(): boolean {

    return this.getRole() === 'CUSTOMER';
  }


  isEmployee(): boolean {

    return this.getRole() === 'EMPLOYEE';
  }


  // =========================================================
  // Load Current User Avatar
  // =========================================================

  loadAvatar(): void {

    /*
     * Do not try to load an avatar
     * when there is no authenticated user.
     */
    if (!this.isLoggedIn()) {

      this.clearAvatar();

      return;
    }


    /*
     * Request the avatar belonging
     * to the currently authenticated account.
     *
     * The auth interceptor automatically
     * attaches the JWT.
     */
    this.http
      .get(
        `${this.ACCOUNT_URL}/me/avatar`,
        {
          responseType: 'blob',
        },
      )
      .pipe(

        /*
         * A 404 simply means:
         *
         * "The account has no avatar."
         *
         * This is NOT an application error.
         */
        catchError(() =>
          of(null),
        ),
      )
      .subscribe({

        next: (blob) => {

          /*
           * No image exists.
           */
          if (!blob) {

            this.clearAvatar();

            return;
          }


          /*
           * Make sure the returned response
           * is actually an image.
           */
          if (
            blob.size === 0 ||
            !blob.type.startsWith('image/')
          ) {

            this.clearAvatar();

            return;
          }


          /*
           * Remove any previous object URL.
           */
          this.revokeAvatarUrl();


          /*
           * Create a browser-local URL
           * for the returned image.
           */
          const objectUrl =
            URL.createObjectURL(blob);


          /*
           * Store it in the reactive signal.
           */
          this.avatarSource.set(
            objectUrl,
          );
        },

        error: () => {

          /*
           * Avatar loading must never
           * break the application.
           */
          this.clearAvatar();
        },
      });
  }


  // =========================================================
  // Set Avatar From Account Page
  // =========================================================

  setAvatarFromBlob(
    blob: Blob,
  ): void {

    if (
      !blob ||
      blob.size === 0 ||
      !blob.type.startsWith('image/')
    ) {

      this.clearAvatar();

      return;
    }


    this.revokeAvatarUrl();


    const objectUrl =
      URL.createObjectURL(blob);


    this.avatarSource.set(
      objectUrl,
    );
  }


  // =========================================================
  // Clear Avatar
  // =========================================================

  clearAvatar(): void {

    this.revokeAvatarUrl();

    this.avatarSource.set(null);
  }


  // =========================================================
  // Revoke Avatar URL
  // =========================================================

  private revokeAvatarUrl(): void {

    const currentAvatar =
      this.avatarSource();


    if (currentAvatar) {

      URL.revokeObjectURL(
        currentAvatar,
      );
    }
  }


  // =========================================================
  // Save Session
  // =========================================================

  private saveSession(
    response: AuthResponse,
  ): void {

    localStorage.setItem(
      this.TOKEN_KEY,
      response.token,
    );


    localStorage.setItem(
      this.USER_KEY,
      JSON.stringify(response),
    );


    this.session.set(
      response,
    );
  }


  // =========================================================
  // Load Stored User
  // =========================================================

  private loadStoredUser():
    AuthResponse | null {

    const storedUser =
      localStorage.getItem(
        this.USER_KEY,
      );


    if (!storedUser) {

      return null;
    }


    try {

      return JSON.parse(
        storedUser,
      ) as AuthResponse;

    } catch {

      localStorage.removeItem(
        this.TOKEN_KEY,
      );

      localStorage.removeItem(
        this.USER_KEY,
      );

      return null;
    }
  }
}
