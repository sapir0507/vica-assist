import { Injectable } from '@angular/core';
import { delay, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = false;
  redirectUrl: string | null = null;

  constructor() { }

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
    this.isLoggedIn = false;
  }
}
