import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Do not attach JWT to authentication endpoints.
  if (
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register')
  ) {
    return next(req);
  }

  // If there is no authenticated session, send the request normally.
  if (!token) {
    return next(req);
  }

  const authenticatedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authenticatedRequest);
};
