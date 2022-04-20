import { Injectable } from '@angular/core';
import { Router,
         CanActivate,
         ActivatedRouteSnapshot
       } from '@angular/router';
import { AuthService } from './auth.service';
import decode from 'jwt-decode';
import { globalAgent } from 'http';
import { SessionQuery } from '../session/session.query';

@Injectable()
export class RoleGuardService implements CanActivate {

  constructor(
    public auth: AuthService,
    private sessionQuery: SessionQuery, 
    public router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // this will be passed from the route config
    // on the data property
    const expectedRole = route.data['expectedRole'];
    const token: string = localStorage.getItem('token') || '';
    console.log('token', token, ' -- decode --', decode(token))
    const role = this.sessionQuery.isLoggedIn;
    // // decode the token to get its payload
    const isLoggedIn = role === 'agent' || role === 'customer'? true : false;
    if (!this.auth.isAuthenticated() || role !== expectedRole) {
      this.router.navigate(['login']); 
      return false;
    }
    return true;
  }
}