import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionStore } from './session.store';
import { environment } from 'src/environments/environment';
import { Hotel } from '../hotel/ihotel';
import { catchError } from 'rxjs';


interface currentUser{
  username?: string,
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
    const AllUsers = this._login(username, password).pipe(catchError(err => err))
    .subscribe((data: any) => {
      console.log(data)
      this.currentUser.username = username
      if(data){
        this.currentUser.role = data[0].role 
        this.currentUser.isLoggedIn = true
      } 
      else{
        this.currentUser.role = ""
        this.currentUser.isLoggedIn = false
      }
    })
    // console.log(AllUsers)
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

  // async updateUserName(newName: string) { // since we don't use a server we don't need this, right?
  //   this.sessionStore.setLoading(true);

    // await this.http(...).toPromise();
    // this.sessionStore.update({ name: newName});
    
  //   this.sessionStore.setLoading(false);
  // }  

  destroy(){
    this.sessionStore.destroy();
  }
}
