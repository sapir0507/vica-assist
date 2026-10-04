import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionStore, UserRole } from './session.store';
import { environment } from 'src/environments/environment';
import { Observable, catchError, finalize, of, tap } from 'rxjs';

const date = new Date().getDate() + 30

interface currentUser{
  username?: string,
  password?: string,
  role?: UserRole,
  experationDate?: number,
  isLoggedIn?: boolean
}


/**
 * Handles logging a user in (locally or via a third party) and keeps the
 * Akita `SessionStore` updated with the current user's identity and role.
 *
 * Third-party sign-in (Twitter/Facebook) is stubbed out for now: only
 * `siteLogin` (username/password against the backend's `login` endpoint)
 * is implemented.
 */
@Injectable({
  providedIn: 'root'
})
export class SessionService {

  HotelServiceUrl: string = environment.api + 'login'
  currentUser: currentUser = {
    username: '',
    password: '',
    role: 'customer',
    experationDate: date - 30,
    isLoggedIn: false
  }
  userInDB: Observable<currentUser[]> | null = null;

  constructor(
    private sessionStore: SessionStore,
    private http: HttpClient
    ) {
       this.updateCurrentUser(this.currentUser)
  }

  private _login(username: string, password: string): Observable<currentUser[]>{
    const url = this.HotelServiceUrl ;
    let params: HttpParams = new HttpParams();
    params = params.append('username', username).append('password', password);
    return this.http.get<currentUser[]>(url, {params}).pipe(  )
  } 

  login(username?: string, password?: string, thirdparty?: string){
    if(thirdparty){
      switch (thirdparty) {
        case "TWITTER":
          return null
        case "FACEBOOK":
          return null
        default:
          if(username&&password) return this.siteLogin(username, password);
          else return null;
      }
    }
    else if(username&&password) return this.siteLogin(username, password); 
         else return null;
    
  }

  /** Looks up a user by username/password and, if found, marks the session as logged in. */
  siteLogin(username: string, password: string): Observable<currentUser[]>{
    this.sessionStore.setLoading(true);
    return this._login(username, password).pipe(
      tap( user => {
        if(user && user[0]){
          user[0].isLoggedIn = true;
          this.updateCurrentUser(user[0]) //updating the store per the documents
        }
      }),
      catchError(error => {
        this.sessionStore.setError(error);
        return of([]);
      }),
      finalize(() => this.sessionStore.setLoading(false))
    );
  }
  
  updateUsername(newName: string){
    try 
    {
        this.sessionStore.update((state) => ({
          ...state,
          username: newName
        }));
    } catch(error) {
      this.sessionStore.setError(error);
    }
  }

  updatePassword(newPass: string){
    try 
    {
        this.sessionStore.update(state => ({
          ...state,
          password: newPass
        }));
    } catch(error) {
      this.sessionStore.setError(error);
    }
  }

  updateRole(newRole: UserRole){
    try
    {
        this.sessionStore.update(state => ({
          ...state,
           role: newRole
        }));
    } catch(error) {
      this.sessionStore.setError(error);
    }
  }

  /** Clears the session's logged-in flag; this is the one thing route guards actually check. */
  logout(){
    this.sessionStore.update(state => ({
      ...state,
      isLoggedIn: false
    }));
  }

  updateCurrentUser(currentUser: currentUser){
    this.sessionStore.update(state=>{
      return{
        ...state,
        username: currentUser.username,
        password: currentUser.password,
        role: currentUser.role,
        isLoggedIn: currentUser.isLoggedIn,
        experationDate: date
      }
    })
  }

  

  destroy(){
    this.sessionStore.destroy();
  }
}
