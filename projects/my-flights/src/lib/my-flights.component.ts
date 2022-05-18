import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MyFlightsService } from './my-flights.service';
import { MatAccordion } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FlightsRequest } from 'src/app/interfaces/flight.interface';

@Component({
  selector: 'lib-myFlights',
  templateUrl: './my-flights.component.html',
  styleUrls: ['./my-flights.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyFlightsComponent implements OnInit {

  @ViewChild(MatAccordion) accordion?: MatAccordion;
  private NameValidator = '[a-zA-Z]*[ ]+[a-zA-Z]*'
  private HourValidator = '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  private _hasStop: boolean = false;
  NewFlight?: FlightsRequest;
  showHint: boolean = false;
  addDivider: boolean = false;

  step: number = 0;
  hide = true;

  newFlightForm: FormGroup = this.fb.group({
    dest: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9,]*')]],
    fullName: ['', [Validators.required, Validators.pattern(this.NameValidator)]],
    myID: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(9), Validators.pattern('[0-9]*')]],
    passangersFullName: this.fb.array([]),
    org: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9,\s]*')]],
    departureDate: ['', [Validators.required]],
    returnDate: ['', [Validators.required]],
    departureHour: ['', [Validators.required, Validators.pattern(this.HourValidator)]],
    returnHour: ['', [Validators.required, Validators.pattern(this.HourValidator)]],
    stops: ['', Validators.required],
    stopDuration: ['', [Validators.pattern(this.HourValidator)]],
    bagage: ['', Validators.required],
    moreInfo: [''],
    price: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(4), Validators.pattern('[1-9][0-9]*')]]
  })

  get passangersFullName() {
    return (this.newFlightForm.controls['passangersFullName']) as FormArray;
  }

  constructor(
    private SFlight: MyFlightsService,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar
) {}

  ngOnInit(): void {
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
    this.passangersFullName.length === 0 ? this.addDivider = false : ""
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
    this.newFlightForm.get('stops')?.value === '1' ? this._hasStop = true : this._hasStop = false;
    this._hasStop? this.newFlightForm.get('stopsDuration')?.addValidators(Validators.required):this.newFlightForm.get('stopsDuration')?.removeValidators(Validators.required)
  }

  hasStop() {
    return this._hasStop;
  }

  addFlight() {
    console.log('addFlight -> component')

    if (this.newFlightForm.valid) {
      const passNum = this.passangersFullName.length + 1;
      this.NewFlight = {
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
