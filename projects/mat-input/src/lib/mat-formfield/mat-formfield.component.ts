import { Component, Input, OnInit } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'form-field',
  templateUrl: './mat-formfield.component.html',
  styleUrls: ['./mat-formfield.component.scss']
})
export class MatFormfieldComponent implements OnInit {
  @Input() label?: string;
  @Input() formControlName?: string;
  @Input() type: string = 'text';
  @Input() hint?: string;
  @Input() IconName?: string;

  @Input() isRequired?: boolean = false;
  @Input() isTouched?: boolean = false;
  @Input() isChanged?: boolean = false;
  @Input() isIcon?: boolean = false;

  form?: FormGroup;
  formControl?: FormControl;
  matcher = new MyErrorStateMatcher();


  constructor(private fb: FormBuilder) { 
    const ValidatorsArray = []
    const TypesList = ['color', 'date', 'datetime-local', 'email', 'month', 'number', 'password', 'text', 'search', 'tel', 'time', 'url', 'week']

    if(this.type && !TypesList.includes(this.type))
      this.type = 'text';

    if(this.type === 'email')
      ValidatorsArray.push(Validators.email)
    if(this.isRequired)
      ValidatorsArray.push(Validators.required) 
    

    this.formControl = new FormControl('', ValidatorsArray);

   }

  ngOnInit(): void {
    if(typeof(this.formControlName)==="string"){
      this.form = this.fb.group({
        
      })
     
    }
  }

}
