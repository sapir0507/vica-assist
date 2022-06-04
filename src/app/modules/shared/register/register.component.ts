import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RegisterRequest } from 'src/app/services/register/register.model';
import { RegisterService } from 'src/app/services/register/register.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  private registerRequest: RegisterRequest = {
    active: 1,
    username: 'sapir0507',
    password: '1234',
    email: 'sapir.s@info.cts.org.il'
  }

  formGroup = new FormGroup({
    username: new FormControl(undefined, [Validators.required]),
    role: new FormControl(undefined, [Validators.required]),
    password: new FormControl(undefined, Validators.compose([Validators.required, Validators.minLength(4)])),
    email: new FormControl(undefined, Validators.compose([Validators.required]))
  });

  constructor(
    private registerService: RegisterService
  ) { }

  ngOnInit(): void {
  }

  onSubmit(){

    const role = this.formGroup.get('role')?.value;
    if(this.formGroup.valid){
        this.registerRequest = {
          active: 1,
          username: this.formGroup.get('username')?.value,
          password: this.formGroup.get('password')?.value,
          email: this.formGroup.get('email')?.value,
          role: role === 'agent' || role === 'customer'? role : 'customer'
        }
        // this.registerService.add()
        this.registerService.addRegister(this.registerRequest)
    }
  }

}
