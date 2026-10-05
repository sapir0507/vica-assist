import { Component, inject, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { LinkStore } from 'src/app/services/links/link.store';
import { SessionQuery } from 'src/app/services/session/session.query';
import { SessionService } from 'src/app/services/session/session.service';
import { environment } from 'src/environments/environment';

const navigationExtras: NavigationExtras = {
  queryParamsHandling: 'preserve',
  preserveFragment: true
};


@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  


  formGroup = new FormGroup({
    username: new FormControl<string | undefined>(undefined, [Validators.required]),
    password: new FormControl<string | undefined>(undefined, Validators.compose([Validators.required, Validators.minLength(4)]))
  });

  isLoading$ = this.sessionQuery.selectLoading();
  error$ = this.sessionQuery.selectError();
  private reminder: Subject<boolean> = new Subject();
  private _status: boolean = false;
  myError?: boolean;
  private linkStore = inject(LinkStore);

  constructor(
    private router: Router,
    private sessionQuery: SessionQuery,
    private sessionService: SessionService,
    ngZone: NgZone
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
    this.myError = false;
    this.sessionService.login(this.formGroup.value['username'] ?? undefined, this.formGroup.value['password'] ?? undefined)
      ?.subscribe(() => {
        if(this.sessionQuery.getValue().isLoggedIn){
          this.linkStore.updateSharedLinks_AfterLogin()
          this.router.navigate(['/homepage'], navigationExtras);
        } else {
          this.myError = true;
        }
      })
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.reminder.next(true)
    this.reminder.complete()
  }
  

}
