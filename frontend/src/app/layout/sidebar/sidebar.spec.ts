import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { Sidebar } from './sidebar';
import { AuthService } from '../../services/auth.service';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('clears the current session and navigates to login when logout is triggered', () => {
    const navigateSpy = vi
      .spyOn(router, 'navigateByUrl')
      .mockResolvedValue(true);

    component.logout();

    expect(authService.isLoggedIn()).toBe(false);
    expect(authService.getToken()).toBeNull();
    expect(authService.getUser()).toBeNull();

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();

    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });
});
