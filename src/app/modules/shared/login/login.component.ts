import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { canonicalPlace } from '@vica-assist/shared';
import { LinkStore } from 'src/app/services/links/link.store';
import { SessionStore } from 'src/app/services/session/session.store';

const navigationExtras: NavigationExtras = {
  queryParamsHandling: 'preserve',
  preserveFragment: true
};


@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {

  formGroup = new FormGroup({
    username: new FormControl<string | undefined>(undefined, [Validators.required]),
    password: new FormControl<string | undefined>(undefined, Validators.compose([Validators.required, Validators.minLength(4)]))
  });

  myError = signal(false);
  protected sessionStore = inject(SessionStore);
  private linkStore = inject(LinkStore);
  private route = inject(ActivatedRoute);

  /** The place a visitor chose on the homepage, if it is a real one: nothing else from the address is used. */
  readonly plannedPlace = canonicalPlace(this.route.snapshot.queryParamMap.get('destination'));

  constructor(
    private router: Router
    ) { }

   ngOnInit(): void {/* empty*/}

  onSubmit(){
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.myError.set(false);
    this.sessionStore.login(this.formGroup.value['username'] ?? undefined, this.formGroup.value['password'] ?? undefined)
      ?.subscribe(() => {
        if(this.sessionStore.isLoggedIn()){
          this.linkStore.updateSharedLinks_AfterLogin()
          this.router.navigate(['/homepage'], navigationExtras);
        } else {
          this.myError.set(true);
        }
      })
  }

}
