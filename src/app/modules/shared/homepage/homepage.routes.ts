import { Routes } from '@angular/router';
import { roleMatch } from 'src/app/services/auth-guard/role.match';

export const HOMEPAGE_ROUTES: Routes = [
  {
    path: '',
    canMatch: [roleMatch('agent')],
    loadComponent: () =>
      import('./agent-homepage/agent-homepage.component').then(m => m.AgentHomepageComponent)
  },
  {
    path: '',
    canMatch: [roleMatch('customer')],
    loadComponent: () =>
      import('./user-homepage/user-homepage.component').then(m => m.UserHomepageComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./generic-homepage/generic-homepage.component').then(m => m.GenericHomepageComponent)
  }
];
