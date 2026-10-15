import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MyFlightsService } from './my-flights.service';
import { MatAccordion } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { activeOptions, checkFlight, ConfigService, dateRangeValidator, describePreferences, FlightsRequest, fullName, israeliId, Order, toDateInputValue } from '@vica-assist/shared';

@Component({
  standalone: false,
  selector: 'lib-myFlights',
  templateUrl: './my-flights.component.html',
  styleUrls: ['./my-flights.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyFlightsComponent implements OnInit {

  @ViewChild(MatAccordion) accordion?: MatAccordion;
  private configService = inject(ConfigService);
  private CountryValidator = '[a-zA-Z ]*'

  private HourValidator = '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  private _hasStop = false;
  @Input() orderID: string | null = null; //id of order
  @Input() order?: Order; //order used to prefill the form
  NewFlight?: FlightsRequest;
  showHint = false;
  addDivider = false;

  step = 0;
  hide = true;

  newFlightForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, fullName(this.configService.config().limits.nameMaxLength)]],
    myID: ['', [Validators.required, israeliId]],
    // Set by the request: an offer is always for the trip's own destination.
    dest: [{ value: '', disabled: true }],
    org: ['', [Validators.required, Validators.pattern(this.CountryValidator)]],
    passangersFullName: this.fb.array([]),
    departureDate: ['', [Validators.required]],
    returnDate: ['', [Validators.required]],
    departureHour: ['', [Validators.required, Validators.pattern(this.HourValidator)]],
    returnHour: ['', [Validators.required, Validators.pattern(this.HourValidator)]],
    airlineId: ['', Validators.required],
    cabin: ['economy', Validators.required],
    stops: ['', Validators.required],
    stopDuration: ['', [Validators.pattern(this.HourValidator)]],
    bagage: ['', Validators.required],
    moreInfo: [''],
    price: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(4), Validators.pattern('[1-9][0-9]*')]]
  }, { validators: dateRangeValidator('departureDate', 'returnDate') })

  get airlines() {
    return this.configService.config().airlines.filter(airline => airline.active);
  }

  get cabins() {
    return activeOptions(this.configService.config().cabins);
  }

  get stopChoices(): number[] {
    return Array.from({ length: this.configService.config().limits.maxStops + 1 }, (_, stops) => stops);
  }

  get wishes(): string[] {
    return describePreferences(this.order?.preferences, this.configService.config()).flight;
  }

  get warnings(): string[] {
    const value = this.newFlightForm.value;
    return checkFlight(this.order, {
      stops: value.stops,
      stopDuration: value.stopDuration,
      airlineId: value.airlineId,
      cabin: value.cabin,
      bagage: value.bagage,
      departureHour: value.departureHour,
      price: value.price
    }, this.configService.config());
  }

  get passangersFullName() {
    return (this.newFlightForm.controls['passangersFullName']) as FormArray;
  }

  constructor(
    private SFlight: MyFlightsService,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar
) {
}

  ngOnInit(): void {

    this.newFlightForm.patchValue({
      dest: this.order?.destination,
      org: this.order?.origin,
      departureDate: toDateInputValue(this.order?.departureDate),
      returnDate: toDateInputValue(this.order?.returnDate),
      fullName: this.order?.passDetails[0].fullName,
      myID: this.order?.passDetails[0].passID,
      cabin: this.order?.preferences?.flight?.cabin ?? 'economy'
    })

  }

  ngOnChanges(): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.

    this.newFlightForm.patchValue({
      dest: this.order?.destination,
      org: this.order?.origin,
      departureDate: toDateInputValue(this.order?.departureDate),
      returnDate: toDateInputValue(this.order?.returnDate),
      fullName: this.order?.passDetails[0].fullName,
      myID: this.order?.passDetails[0].passID,
      cabin: this.order?.preferences?.flight?.cabin ?? 'economy'
    })
  }


  newFormVal(str: string) {
    return this.newFlightForm.get(str)?.value;
  }

  AddNewCustomer() {
    const v = this.newFormVal('myID') && this.newFormVal('fullName') ? true : false;
    if(v){
      this.showHint = false;
      this.SFlight.createNewPassangerInput(this.fb, this.passangersFullName);
    } else {
      this.showHint = true;
      this.addDivider = true;
    }
  }

  DeleteAddedCustomer(i: number) {
    this.passangersFullName.removeAt(i)
    if (this.passangersFullName.length === 0) this.addDivider = false;
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  openSnackBar(message: string) {
    this._snackBar.open(message);
  }

  onPassNumChange() {
    const newNum = this.newFlightForm.get('passangers')?.value;
    console.log(newNum)

  }

  onSelectionChange() : void {
    this._hasStop = Number(this.newFlightForm.get('stops')?.value) > 0;
    const stopDuration = this.newFlightForm.get('stopDuration');
    if (this._hasStop) stopDuration?.addValidators(Validators.required);
    else stopDuration?.removeValidators(Validators.required);
    stopDuration?.updateValueAndValidity();
  }

  hasStop() {
    return this._hasStop;
  }

  addFlight() {
    if (this.newFlightForm.valid && this.orderID) {
      const passNum = this.passangersFullName.length + 1;
      this.NewFlight = {
        orderID: this.orderID,
        dest: this.newFlightForm.get('dest')?.value,
        passangers: passNum,
        fullName: this.newFlightForm.get('fullName')?.value,
        passID: this.newFlightForm.get('myID')?.value,
        passArray: this.newFlightForm.get('passangersFullName')?.value,
        org: this.newFlightForm.get('org')?.value,
        returnDate: this.newFlightForm.get('returnDate')?.value,
        departureDate: this.newFlightForm.get('departureDate')?.value,
        returnHour: this.newFlightForm.get('returnHour')?.value,
        departureHour: this.newFlightForm.get('departureHour')?.value,
        airlineId: this.newFlightForm.get('airlineId')?.value,
        airline: this.airlines.find(airline => airline.id === this.newFlightForm.get('airlineId')?.value)?.name,
        cabin: this.newFlightForm.get('cabin')?.value,
        stops: this.newFlightForm.get('stops')?.value,
        stopDuration: this.newFlightForm.get('stopDuration')?.value,
        bagage: this.newFlightForm.get('bagage')?.value,
        moreInfo: this.newFlightForm.get('moreInfo')?.value,
        price: this.newFlightForm.get('price')?.value,
      }
      this.SFlight.addFlight(this.NewFlight)
      this.openSnackBar("Flight Added!")
    }
    else {
      this.openSnackBar("Form is invalid! Please fill all the required filds to submit the form.")
    }
  }

}
