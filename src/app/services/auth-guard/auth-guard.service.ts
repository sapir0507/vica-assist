import { Injectable } from '@angular/core';
import { 
  Router,
  UrlTree, 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  NavigationExtras
} from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(
    public auth: AuthService, 
    public router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
    )
    // : boolean | Promise<boolean> 
       :true|UrlTree
      {
      const url: string = state.url; 
      return this.checkLogin(url);
    //   var isAuthenticated = this.auth.getAuthStatus();
    // if (!isAuthenticated) {
    //   this.router.navigate(['/login']);
    //   return false;
    // }
    // return isAuthenticated;
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): true|UrlTree {
    return this.canActivate(route, state);
  }

  checkLogin(url: string): true|UrlTree {
    if (this.auth.isLoggedIn) { return true; }

    // Store the attempted URL for redirecting
    this.auth.redirectUrl = url;

     // Create a dummy session id
     const sessionId = 123456789;

     const navigationExtras: NavigationExtras = {
      queryParams: { session_id: sessionId },
      fragment: 'anchor'
    };

    // Redirect to the login page
    // return this.router.parseUrl('/login');

    // Redirect to the login page with extras
    return this.router.createUrlTree(['/login'], navigationExtras);
 
  }
}