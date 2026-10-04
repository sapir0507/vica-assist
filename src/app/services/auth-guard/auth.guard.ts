import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionQuery } from 'src/app/services/session/session.query';
import { UserRole } from 'src/app/services/session/session.store';

export const authGuard: CanActivateFn = (route) => {
  const sessionQuery = inject(SessionQuery);
  const router = inject(Router);

  const { isLoggedIn, role } = sessionQuery.getValue();
  const expectedRole = route.data['expectedRole'] as UserRole | undefined;

  if (!isLoggedIn) {
    return router.createUrlTree(['/login']);
  }
  if (expectedRole && role !== expectedRole) {
    return router.createUrlTree(['/homepage']);
  }
  return true;
};
