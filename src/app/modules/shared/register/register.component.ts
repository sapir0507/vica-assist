import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DestinationStore } from 'src/app/services/destination/destination.store';
import { RegisterRequest } from 'src/app/services/register/register.model';
import { RegisterService } from 'src/app/services/register/register.service';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit {

  private registerRequest: RegisterRequest = {
    username: 'sapir0507',
    password: '1234',
    email: 'user@example.com'
  }

  formGroup = new FormGroup({
    username: new FormControl<string | undefined>(undefined, [Validators.required]),
    password: new FormControl<string | undefined>(undefined, Validators.compose([Validators.required, Validators.minLength(4)])),
    email: new FormControl<string | undefined>(undefined, Validators.compose([Validators.required, Validators.email]))
  });

  private route = inject(ActivatedRoute);

  /** The place a visitor chose on the homepage, if it is a real one: nothing else from the address is used. */
  private readonly planned = inject(DestinationStore).bookable(this.route.snapshot.queryParamMap.get('destination'));
  readonly plannedPlace = this.planned?.name ?? null;
  readonly loginParams = this.planned ? { destination: this.planned.id } : {};

  constructor(
    private registerService: RegisterService
  ) { }

  ngOnInit(): void {/* empty*/}

  onSubmit(){
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const { username, password, email } = this.formGroup.value;
    this.registerRequest = {
      username: username ?? undefined,
      password: password ?? undefined,
      email: email ?? undefined,
      role: 'customer'
    };
    this.registerService.addRegister(this.registerRequest);
  }

}
