import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { User } from 'src/app/services/IUser/iuser';
import { SessionQuery } from 'src/app/services/session/session.query';
import { SessionService } from 'src/app/services/session/session.service';
import { SessionStore } from 'src/app/services/session/session.store'

const navigationExtras: NavigationExtras = {
  queryParamsHandling: 'preserve',
  preserveFragment: true
};


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  
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
    private router: Router,
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

    // Redirect the user
    this.router.navigate([''], navigationExtras);

    // if(isLoggedIn.isLoggedIn){
    //   window.location.href = ""
    // }
  }

  onGoogleAuthenticator($event: Event) {
    console.log($event);
  }

  

}
