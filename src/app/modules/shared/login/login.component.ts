import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';
import { User } from 'src/app/services/IUser/iuser';
import { SessionQuery } from 'src/app/services/session/session.query';
import { SessionService } from 'src/app/services/session/session.service';
import { SessionState, SessionStore } from 'src/app/services/session/session.store'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  // userNameConfig: AcademyInputConfig = {
  //   label: 'user name',
  //   type: 'text',
  //   placeholder: 'the best user name!'
  // }
  // passwordConfig: AcademyInputConfig = {
  //   label: 'Password',
  //   type: 'password',
  //   placeholder: 'I\'m not looking!🤫'
  // }

  formGroup = new FormGroup({
    username: new FormControl(undefined, [Validators.required]),
    password: new FormControl(undefined, Validators.compose([Validators.required, Validators.minLength(4)])),
    googleAuthenticator: new FormControl(undefined, Validators.required)
  });

  user: User = {
    username: 'sapir.s@gmail.com',
    password: '123321',
    role: 'admin'
  };

  isLoading$ = this.sessionQuery.selectLoading();
  error$ = this.sessionQuery.selectError();
  
  constructor(
    private auth: AuthService,
    private sessionQuery: SessionQuery,
    private sessionService: SessionService,
    private loginStore: SessionStore
    ) {

      this.loginStore.update(store => {
        return {
          ...store, 
          role: '' ,
          username: '',
        }
      })

     }
  
  ngOnInit(): void {
  }

  onSubmit(){
    console.log(this.formGroup.value)
    const isLoggedIn = this.sessionService.login(this.formGroup.value['username'], this.formGroup.value['password'])

    this.loginStore.update(store => {
      return {
        ...store, 
        role: isLoggedIn.role ,
        username: isLoggedIn.username,
      }
    })

    if(isLoggedIn.isLoggedIn){
      window.location.href = ""
    }
  }

  onGoogleAuthenticator($event: Event) {
    console.log($event);
  }

  

}
