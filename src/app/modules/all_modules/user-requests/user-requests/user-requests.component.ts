import { Component, OnInit, ChangeDetectionStrategy, effect, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderStore } from 'src/app/services/order/order.store';
import { SessionStore } from 'src/app/services/session/session.store';
import { dateRangeValidator, notInPastValidator, OrderRequest, passDetails } from '@vica-assist/shared';
import { DESTINATIONS, Destination } from 'src/app/modules/shared/destinations/destinations';
import { differentPlaces, notBlank } from '../validators';

@Component({
  standalone: false,
  selector: 'userRequests',
  templateUrl: './user-requests.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./user-requests.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRequestsComponent implements OnInit {

  readonly steps = ['Destination', 'Travelers', 'Trip details'];
  readonly destinations = DESTINATIONS;
  step = 0;
  orderID: string | null = null;
  requestForm: FormGroup = this.fb.group({

    //do you want a hotel only or a flight too
    order:this.fb.control('both', [Validators.required, Validators.pattern('[a-zA-Z ]*')]),
    //details
    origin: this.fb.control('', [Validators.required, notBlank]),
    destination: this.fb.control('', [Validators.required, notBlank]),
    passDetails: this.fb.array([] as passDetails[], [Validators.required]),
    Dates: new FormGroup({
      departureDate: this.fb.control('', [Validators.required, notInPastValidator()]),
      returnDate: this.fb.control('', [Validators.required])
    }, { validators: dateRangeValidator('departureDate', 'returnDate') }),

    hotel: this.fb.group({
      stars: this.fb.control(''),
    }),
    price: this.fb.control('0', [Validators.required, Validators.min(1)])

  }, { validators: differentPlaces('origin', 'destination') })

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

  private orderStore = inject(OrderStore);
  private sessionStore = inject(SessionStore);

  constructor(
    private fb: FormBuilder,
    private _snackBar: MatSnackBar
  ) {
      this.addNewPass()

      effect(() => {
        const orders = this.orderStore.orders();
        if(orders) this.orderID = '' + (orders.length + 1) //*
      });
    }

  ngOnInit(): void {/* empty*/}

  get canContinue(): boolean {
    if (this.step === 0) return this.requestForm.controls['destination'].valid;
    if (this.step === 1) return this.passDetails.valid;
    return true;
  }

  isSelected(destination: Destination): boolean {
    return this.requestForm.value.destination?.trim().toLowerCase() === destination.name.toLowerCase();
  }

  selectDestination(destination: Destination) {
    this.requestForm.patchValue({ destination: destination.name });
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  addNewPass(): void{
    const newPass: FormGroup = this.fb.group({
      fullName: this.fb.control('', [Validators.required, notBlank]),
      passID: this.fb.control('', [Validators.required, Validators.min(1)])
    })
    this.passDetails.push(newPass)
  }

  deleteExistingPass(i: number){
    this.passDetails.removeAt(i)
  }


  onSubmit(){
    if(this.requestForm.valid) {
      this.orderID = this.orderID? this.orderID : '1';
      const newOrder: OrderRequest = {
        choice: this.order,
        orderID: this.orderID,
        status: 'pending',
        departureDate: this.Dates.get('departureDate')?.value,
        returnDate: this.Dates.get('returnDate')?.value,
        origin: this.requestForm.get('origin')?.value.trim(),
        destination: this.requestForm.get('destination')?.value.trim(),
        passDetails: (this.requestForm.get('passDetails')?.value as passDetails[]).map(traveler => ({ ...traveler, fullName: traveler.fullName.trim() })),
        stars: this.hotel.get('stars')?.value,
        priceRange: this.requestForm.get('price')?.value,
        customer: this.sessionStore.username(),
        createdAt: new Date().toISOString()
      }
    console.log(newOrder)
    this.orderStore.addOrder(newOrder);
    this.openSnackBar("Order added!")
    this.requestForm.reset({ order: 'both', price: '0' });
    this.step = 0;
  }
  }

  openSnackBar(message: string) {
    this._snackBar.open(message);
  }

}
