import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RegisterRequest } from 'src/app/services/register/register.model';
import { RegisterService } from 'src/app/services/register/register.service';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  private registerRequest: RegisterRequest = {
    username: 'sapir0507',
    password: '1234',
    email: 'user@example.com'
  }

  formGroup = new FormGroup({
    username: new FormControl<string | undefined>(undefined, [Validators.required]),
    role: new FormControl<string | undefined>(undefined, [Validators.required]),
    password: new FormControl<string | undefined>(undefined, Validators.compose([Validators.required, Validators.minLength(4)])),
    email: new FormControl<string | undefined>(undefined, Validators.compose([Validators.required]))
  });

  constructor(
    private registerService: RegisterService
  ) { }

  ngOnInit(): void {/* empty*/}

  onSubmit(){

    const role = this.formGroup.get('role')?.value;
    if(this.formGroup.valid){
        this.registerRequest = {
          username: this.formGroup.get('username')?.value ?? undefined,
          password: this.formGroup.get('password')?.value ?? undefined,
          email: this.formGroup.get('email')?.value ?? undefined,
          role: role === 'agent' || role === 'customer'? role : 'customer'
        }
        // this.registerService.add()
        this.registerService.addRegister(this.registerRequest)
    }
  }

}
