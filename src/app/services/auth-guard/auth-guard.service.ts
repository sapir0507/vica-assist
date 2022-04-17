import { Injectable } from '@angular/core';
import { 
  Router,
  UrlTree, 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot 
} from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(
    public auth: AuthService, 
    public router: Router) {}

  canActivate(
    // route: ActivatedRouteSnapshot,
    // state: RouterStateSnapshot
    ): boolean | Promise<boolean> {
      var isAuthenticated = this.auth.getAuthStatus();
    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }
    return isAuthenticated;
  }
}