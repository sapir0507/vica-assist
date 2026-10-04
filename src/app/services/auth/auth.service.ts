import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

/**
 * Tracks the current session's authentication state and identity provider
 * (local account vs. a third party such as Google).
 *
 * `isAuthenticated()` is currently a stub that always returns `true`; it's
 * meant to be wired up to real session/token validation.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = false;
  redirectUrl: string | null = null;
  isLocal: string = 'local';

  private isThirdParty(){
    if(this.isLocal === 'local') return false;
    else return true;
  }

  /**
   * Records which identity provider the current session is using.
   * - `isThirdParty` false: leaves `isLocal` unchanged (stays "local").
   * - `isThirdParty` true with a `thirdparty` name: sets `isLocal` to it.
   * - `isThirdParty` true with no name: clears `isLocal`.
   */
  setThirdParty(isThirdParty: boolean, thirdparty?: string){

     !isThirdParty?
        this.isLocal = this.isLocal :
        thirdparty?
            this.isLocal = thirdparty : this.isLocal = ''
  }

  public isAuthenticated(): boolean {
     return true;
  }

  getAuthStatus(){
    return this.isAuthenticated()
  }

  /** Marks the current session as logged in. Always succeeds (no real credential check yet). */
  login(): Observable<boolean>{
    return of(true)
    .pipe(
      tap(()=> this.isLoggedIn = true)
    );
    
  }

  /** Marks the current session as logged out. */
  logout(){
    const third = this.isThirdParty()
    this.isLoggedIn = false;
  }
}
