import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';
import { IUser } from 'src/app/services/IUser/iuser';
import { SessionQuery } from 'src/app/services/session/session.query';

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

  user: IUser = {
    Username: 'sapir.s@gmail.com',
    Password: '123321',
    Role: 'admin'
  };

  isLoading$ = this.sessionQuery.selectLoading();
  error$ = this.sessionQuery.selectError();
  
  constructor(
    private auth: AuthService,
    private sessionQuery: SessionQuery
    ) { }
  
  ngOnInit(): void {
  }

  onSubmit(){
    console.log(this.formGroup.value)
  }

  onGoogleAuthenticator($event: Event) {
    console.log($event);
  }

  

}
