import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore, UserRole } from 'src/app/services/session/session.store';

export const authGuard: CanActivateFn = (route) => {
  const sessionStore = inject(SessionStore);
  const router = inject(Router);

  const isLoggedIn = sessionStore.isLoggedIn();
  const role = sessionStore.role();
  const expectedRole = route.data['expectedRole'] as UserRole | undefined;

  if (!isLoggedIn) {
    return router.createUrlTree(['/login']);
  }
  if (expectedRole && role !== expectedRole) {
    return router.createUrlTree(['/homepage']);
  }
  return true;
};
