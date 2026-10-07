import { Injectable } from '@angular/core';

/**
 * Tracks the current session's identity provider (local account vs. a third
 * party such as Google). Actual login/logout state lives in `SessionService`
 * (backed by the Akita session store) — see session.service.ts's `logout()`.
 *
 * `isAuthenticated()` is currently a stub that always returns `true`; it's
 * meant to be wired up to real session/token validation.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLocal = 'local';

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
    this.isLocal = isThirdParty? (thirdparty || '') : (this.isLocal || '');
  }

  public isAuthenticated(): boolean {
     return true;
  }

  getAuthStatus(){
    return this.isAuthenticated()
  }
}
