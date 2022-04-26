import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FlightsRequest } from './my-flights';
import { MyFlightsService } from './my-flights.service';
import { MatAccordion } from '@angular/material/expansion';

@Component({
  selector: 'lib-myFlights',
  templateUrl: './my-flights.component.html',
  styleUrls: ['./my-flights.component.scss']
})
export class MyFlightsComponent implements OnInit {

  @ViewChild(MatAccordion) accordion?: MatAccordion;
  
  newFlightForm = new FormGroup({
    dest: new FormControl(''),
    passangers: new FormControl(''),
    org: new FormControl(''),
    departureDate: new FormControl(''),
    returnDate: new FormControl(''),
    stops: new FormControl(''),
    bagage: new FormControl(''),
    moreInfo: new FormControl(''),
    price: new FormControl('')
  });

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  NewFlight?: FlightsRequest;

  step: number = 0;
  hide = true;

  constructor(private SFlight: MyFlightsService) { 
    console.log('library');
  }

  ngOnInit(): void {
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

  addFlight(){
    console.log('addFlight -> component')
    this.NewFlight = {
      dest:this.newFlightForm.get('dest')?.value,
      passangers: this.newFlightForm.get('passangers')?.value,
      org: this.newFlightForm.get('org')?.value,
      returnDate: this.newFlightForm.get('returnDate')?.value,
      departureDate: this.newFlightForm.get('departureDate')?.value,
      stops: this.newFlightForm.get('stops')?.value,
      bagage: this.newFlightForm.get('bagage')?.value,
      moreInfo: this.newFlightForm.get('moreInfo')?.value,
      price: this.newFlightForm.get('price')?.value,
    }
    this.SFlight.addFlight(this.NewFlight)
    console.log('addFlight -> flight added')
  }


}
