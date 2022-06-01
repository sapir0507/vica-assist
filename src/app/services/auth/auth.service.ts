import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = false;
  redirectUrl: string | null = null;
  isLocal: string = 'local';

  constructor(
    private sessionService: SessionService
  ) { }

  private isThirdParty(){
    if(this.isLocal === 'local') return false;
    else return true;
  }

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

  login(): Observable<boolean>{
    return of(true)
    .pipe(
      tap(()=> this.isLoggedIn = true)
    );
    
  }

  logout(){
    // if(this.isLocal !== 'local')
    // {
    //   this.onGoogleSignOut()
    // }
    const third = this.isThirdParty()
    this.isLoggedIn = false;
  }

  onGoogleSignOut(){
    this.sessionService.GoogleSignOut()
  }
}
