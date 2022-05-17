import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { userRequestService } from 'src/app/services/user-request/user-request.service';
import { OrderRequest, passDetails } from 'src/interfaces/order.interface';

@Component({
  selector: 'userRequests',
  templateUrl: './user-requests.component.html',
  styleUrls: ['./user-requests.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRequestsComponent implements OnInit {
  notifier?: Subscription;
  @ViewChild(MatAccordion) accordion?: MatAccordion;
  step: number = 0;
  requestForm: FormGroup = this.fb.group({
    //do you want a hotel only or a flight too
    order:this.fb.control('both', [Validators.required, Validators.pattern('[a-zA-Z ]*')]),
    //details
    origin: this.fb.control('', [Validators.required]),
    destination: this.fb.control('', Validators.required),
    passDetails: this.fb.array([] as passDetails[], [Validators.required]),
    Dates: new FormGroup({
      departureDate: this.fb.control('', [Validators.required]),
      returnDate: this.fb.control('', [Validators.required])
    }),

    hotel: this.fb.group({
      stars: this.fb.control(''),
    }),
    price: this.fb.control('0', [Validators.required])

  })

  get order(){
    return this.requestForm.get('order')?.value as string;
  }

  get Dates(){
    return this.requestForm.get('Dates') as FormGroup;
  }
  get departureDate(){
    return this.Dates.get('departureDate') as FormControl;
  }
  get returnDate(){
    return this.Dates.get('returnDate') as FormControl;
  }

  get hotel(){
    return this.requestForm.get('hotel') as FormGroup;
  }

  get stars(){
    return this.hotel.get('stars') as FormControl;
  }

  get passDetails(): FormArray{
    return (this.requestForm.controls['passDetails']) as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private orderService: userRequestService,
    private _snackBar: MatSnackBar
  ) {
       this.addNewPass()
    }

  ngOnInit(): void {
  }

  setStep(index: number){
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  addNewPass(): void{
    const newPass: FormGroup = this.fb.group({
      fullName: this.fb.control('', [Validators.required]),
      passID: this.fb.control('', [Validators.required])
    })
    this.passDetails.push(newPass)
  }

  deleteExistingPass(i: number){
    this.passDetails.removeAt(i)
  }


  onSubmit(){
    const newOrder: OrderRequest = {
      choice: this.order,
      departureDate: this.Dates.get('departureDate')?.value,
      returnDate: this.Dates.get('returnDate')?.value,
      origin: this.requestForm.get('origin')?.value,
      destination: this.requestForm.get('destination')?.value,
      passDetails: this.requestForm.get('passDetails')?.value,
      stars: this.hotel.get('stars')?.value,
      priceRange: this.requestForm.get('price')?.value 
    }
    console.log(newOrder)
    this.notifier = this.orderService.addOrder(newOrder)
    this.openSnackBar("Order added!")
  }

  openSnackBar(message: string) {
    this._snackBar.open(message);
  }

  ngOnDestroy(): void {
    this.notifier?.unsubscribe()
  }

}
