import { Component, inject, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LinkStore } from 'src/app/services/links/link.store';
import { SessionStore } from 'src/app/services/session/session.store';
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

  myError?: boolean;
  protected sessionStore = inject(SessionStore);
  private linkStore = inject(LinkStore);

  constructor(
    private router: Router,
    ngZone: NgZone
    ) { }

  ngOnInit(): void {

  }

  onSubmit(){
    this.myError = false;
    this.sessionStore.login(this.formGroup.value['username'] ?? undefined, this.formGroup.value['password'] ?? undefined)
      ?.subscribe(() => {
        if(this.sessionStore.isLoggedIn()){
          this.linkStore.updateSharedLinks_AfterLogin()
          this.router.navigate(['/homepage'], navigationExtras);
        } else {
          this.myError = true;
        }
      })
  }

}
