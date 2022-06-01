import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LinkService } from 'src/app/services/links/link.service';
import { SessionQuery } from 'src/app/services/session/session.query';
import { SessionService } from 'src/app/services/session/session.service';
import { environment } from 'src/environments/environment';

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
  user: gapi.auth2.GoogleUser | null = null;
  myError?: boolean;
  // guser;  
  constructor(
    private router: Router,
    private linksService: LinkService,
    private auth: AuthService,
    private sessionQuery: SessionQuery,
    private sessionService: SessionService,
    private ref: ChangeDetectorRef,
    ngZone: NgZone
    ) {

      sessionService.GoogleObservable().subscribe((user: gapi.auth2.GoogleUser | null )=>{
        this.user = user;
        this.ref.detectChanges()
        if(this.user) this.afterSignIn(this.user)
      })

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

  onGoogleSignIn() {
    // const a = this.sessionService.login(this.formGroup.value['username'], this.formGroup.value['password'],'GOOGLE')
    
    // var profile = googleUser.getBasicProfile();

    // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    // console.log('Name: ' + profile.getName());
    // console.log('Image URL: ' + profile.getImageUrl());
    // console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    
    // this.sessionService.GoogleSignin()
    // if(this.user) this.afterSignIn(this.user)
  }

  onGoogleSignOut(){
    this.sessionService.GoogleSignOut()
  }

  afterSignIn(googleUser: gapi.auth2.GoogleUser){
    var profile = googleUser.getBasicProfile()
    var id = profile.getId()
    var name = profile.getName()
    var email = profile.getEmail()
    var imageUrl = profile.getImageUrl()

    //

    this.auth.login().subscribe()
    this.auth.setThirdParty(true,'GOOGLE')
    this.linksService.updateSharedLinks_AfterLogin()
    this.router.navigate(['/homepage'], navigationExtras)
  }

  onSubmit(){
    //login
    const a = this.sessionService.login(this.formGroup.value['username'], this.formGroup.value['password'])
     //if logged in 

    //  if(this._status){
       this.auth.login().pipe().subscribe()
       this.linksService.updateSharedLinks_AfterLogin()
       this.router.navigate(['/homepage'], navigationExtras);
    //  }
   
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
