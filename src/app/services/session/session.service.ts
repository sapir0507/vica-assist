import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionStore } from './session.store';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(
    private sessionStore: SessionStore,
    private http: HttpClient
    ) { }

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
