import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionStore } from './session.store';
import { environment } from 'src/environments/environment';
import { catchError, delay } from 'rxjs';


interface currentUser{
  username?: string,
  password?: string,
  role?: string,
  isLoggedIn?: boolean
}


@Injectable({
  providedIn: 'root'
})
export class SessionService {

  HotelServiceUrl: string = environment.api + 'login'
  currentUser: currentUser = {}

  constructor(
    private sessionStore: SessionStore,
    private http: HttpClient
    ) { }

  private _login(username: string, password: string){
    return this.http.get<currentUser>(this.HotelServiceUrl + `?username=${username}&password=${password}`, {})
  } 

  login(username: string, password: string){
    //only enters the subscribe after clicked the second time. 
    const AllUsers = this._login(username, password)
    .pipe(
      catchError(err => err)
    )
    .subscribe((data: any) => {
      // console.log(data)
      this.currentUser.username = username
      if(data){
        this.currentUser.role = data[0].role 
        this.currentUser.isLoggedIn = true
        this.updateCurrentUser(this.currentUser)
        this.updatePassword(password)
        console.log("session store value", this.sessionStore.getValue())
      } 
      else{
        this.currentUser.role = ""
        this.currentUser.isLoggedIn = false
      }
    })
    return this.currentUser
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

  updateLoginDetails(newName: string, newPass: string, newRole: string){
    this.updateUsername(newName)
    this.updatePassword(newPass)
    this.updateRole(newRole)
  }

  updateCurrentUser(currentUser: currentUser){
    this.sessionStore.update(store=>{
      return{
        ...store,
        username: currentUser.username,
        password: currentUser.password,
        role: currentUser.role,
        
      }
    })
  }

  

  destroy(){
    this.sessionStore.destroy();
  }
}
