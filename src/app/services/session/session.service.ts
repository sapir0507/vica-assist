import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionStore } from './session.store';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(
    private sessionStore: SessionStore,
    private http: HttpClient
    ) { }

  // login(username: string, password: string){
  //   return this.http(environment.api + 'login').pipe(
  //     tap(name => this.sessionStore.update(name))
  //   )
  // } 

  login(username: string, password: string){
    if(username === 'livetotell' && password === '1234')
      return {
        status: true,
        role: 'agent'
      }
    else return {
        status: true,
        role: 'customer'
    }
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
