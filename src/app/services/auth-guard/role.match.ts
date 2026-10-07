import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { SessionStore, UserRole } from 'src/app/services/session/session.store';

export const roleMatch = (role: UserRole): CanMatchFn => () => inject(SessionStore).role() === role;
