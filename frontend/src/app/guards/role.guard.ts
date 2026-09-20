import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService, UserRole } from '../services/auth.service';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      return router.createUrlTree(['/login']);
    }

    const userRole = authService.getRole();

    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    if (userRole === 'CUSTOMER') {
      return router.createUrlTree(['/customer/dashboard']);
    }

    if (userRole === 'EMPLOYEE') {
      return router.createUrlTree(['/employee/dashboard']);
    }

    if (userRole === 'ADMIN') {
      return router.createUrlTree(['/dashboard']);
    }

    return router.createUrlTree(['/login']);
  };
};
