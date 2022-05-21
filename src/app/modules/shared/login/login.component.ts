import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SessionQuery } from 'src/app/services/session/session.query';
import { SessionService } from 'src/app/services/session/session.service';

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

  isLoading$ = this.sessionQuery.selectLoading();
  error$ = this.sessionQuery.selectError();
  private reminder: Subject<boolean> = new Subject();
  private _status: boolean = false;
  myError: boolean = false;
  
  constructor(
    private router: Router,
    private sessionQuery: SessionQuery,
    private sessionService: SessionService,
    ) {
      sessionQuery.selectIsLoggedIn$
      .pipe(
        takeUntil(this.reminder)
      )
      .subscribe(_status => {
        this._status = _status;
      })
     }
  
  ngOnInit(): void {
  }

  onSubmit(){
    //login
    this.sessionService.login(this.formGroup.value['username'], this.formGroup.value['password'])

     //if logged in
    // if(this._status) {
      this.router.navigate([''], navigationExtras);
    // }
    // else{
      this.myError = true;
    // }
   
    //else

  }

  onGoogleAuthenticator($event: Event) {
    console.log($event);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.reminder.next(true)
    this.reminder.complete()
  }
  

}
