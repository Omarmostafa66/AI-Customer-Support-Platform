import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { AuthService, AuthResponse } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let http: HttpTestingController;

  const customerResponse: AuthResponse = {
    token: 'customer-token',
    userId: 17,
    email: 'customer@example.com',
    role: 'CUSTOMER',
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    authService = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('logs in and stores the authenticated session', () => {
    authService.login(' CUSTOMER@Example.com ', 'Password123').subscribe(response => {
      expect(response).toEqual(customerResponse);
      expect(authService.isLoggedIn()).toBe(true);
      expect(authService.getToken()).toBe('customer-token');
      expect(authService.getUserId()).toBe(17);
      expect(authService.getEmail()).toBe('customer@example.com');
      expect(authService.getRole()).toBe('CUSTOMER');
      expect(authService.isCustomer()).toBe(true);
    });

    const req = http.expectOne('http://localhost:8080/auth/login');

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'customer@example.com',
      password: 'Password123',
    });

    req.flush(customerResponse);
  });

  it('clears the authentication session when logging out', () => {
    authService.login('customer@example.com', 'Password123').subscribe();

    const req = http.expectOne('http://localhost:8080/auth/login');

    expect(req.request.method).toBe('POST');

    req.flush(customerResponse);

    expect(authService.isLoggedIn()).toBe(true);
    expect(authService.getToken()).toBe('customer-token');
    expect(authService.getUser()).toEqual(customerResponse);

    authService.logout();

    expect(authService.isLoggedIn()).toBe(false);
    expect(authService.getToken()).toBeNull();
    expect(authService.getUser()).toBeNull();
    expect(authService.getRole()).toBeNull();
    expect(authService.currentCustomerId()).toBeNull();

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('restores the stored authenticated user after service initialization', () => {
    localStorage.setItem('auth_token', 'stored-token');
    localStorage.setItem('auth_user', JSON.stringify(customerResponse));

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const restoredService = TestBed.inject(AuthService);

    expect(restoredService.isLoggedIn()).toBe(true);
    expect(restoredService.getToken()).toBe('stored-token');
    expect(restoredService.getUserId()).toBe(17);
    expect(restoredService.getRole()).toBe('CUSTOMER');
    expect(restoredService.currentCustomerId()).toBe(17);
  });

  it('removes a corrupted stored user session', () => {
    localStorage.setItem('auth_token', 'invalid-stored-token');
    localStorage.setItem('auth_user', '{invalid-json');

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const restoredService = TestBed.inject(AuthService);

    expect(restoredService.isLoggedIn()).toBe(false);
    expect(restoredService.getToken()).toBeNull();
    expect(restoredService.getUser()).toBeNull();

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
});
