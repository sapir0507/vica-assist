import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionStore } from './session.store';
import { environment } from 'src/environments/environment';
import { catchError, concatWith, delay, Observable, switchMap, of, take, observable, map, concat, Subject, tap, skip, ReplaySubject } from 'rxjs';

const date = new Date().getDate() + 30

interface currentUser{
  username?: string,
  password?: string,
  role?: string,
  experationDate?: number,
  isLoggedIn?: boolean
}


@Injectable({
  providedIn: 'root'
})
export class SessionService {

  HotelServiceUrl: string = environment.api + 'login'
  private auth2: gapi.auth2.GoogleAuth | null = null;
  private subject: ReplaySubject<gapi.auth2.GoogleUser | null> = new ReplaySubject(1);
  currentUser: currentUser = {
    username: '',
    password: '',
    role: 'unknown',
    experationDate: date - 30,
    isLoggedIn: false
  }
  userInDB: Observable<currentUser[]> | null = null;

  constructor(
    private sessionStore: SessionStore,
    private http: HttpClient
    ) { 
       this.updateCurrentUser(this.currentUser)
       gapi.load('auth2', ()=>{
         this.auth2 = gapi.auth2.init({
           client_id: environment.GAPI_CLIENT_ID
         })
       })
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
        case "GOOGLE":
          this.GoogleSignin();
          return this.GoogleObservable();
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

  siteLogin(username: string, password: string){
    let obs1 = this._login(username, password)
    let obs2 = obs1.pipe(
      tap( user => {
        if(user && user[0]){
          user[0].isLoggedIn = true;
          this.updateCurrentUser(user[0]) //updating the store per the documents
        }
        else{
          //  this.updateCurrentUser(this.currentUser)
        }
      })
    ).subscribe()
     
    return obs2;
  }
  
  GoogleSignin(){
    if(this.auth2)
    this.auth2.signIn({
      //
      scope: 'https://www.googleapis.com/auth/gmail.readonly'
    }).then( user => {
      this.subject.next(user)
    }).catch(() => {
      this.subject.next(null)
    })
  }

  GoogleSignOut(){
    if(this.auth2)
    this.auth2.signOut().then(() => {
      this.subject.next(null)
    })
  }

  GoogleObservable(): Observable<gapi.auth2.GoogleUser|null>{
    return this.subject.asObservable()
  }

  updateUsername(newName: string){
    try 
    {
        this.sessionStore.update(state => ({
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
            password: newPass

        }));
    } catch(error) {
      this.sessionStore.setError(error);
    }
  }

  updateRole(newRole: string){
    try 
    {
        this.sessionStore.update(state => ({
           role: newRole

        }));
    } catch(error) {
      this.sessionStore.setError(error);
    }
  }

  updateCurrentUser(currentUser: currentUser){
    this.sessionStore.update(store=>{
      return{
        ...store,
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
