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
    origin: new FormControl(''),
    departureDate: new FormControl(''),
    returnDate: new FormControl(''),
    airport: new FormControl(''),
    airways: new FormControl(''),
    moreInfo: new FormControl(''),
    price: new FormControl('')
  });

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  NewFlight: FlightsRequest | null = null;

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
      org: this.newFlightForm.get('origin')?.value,
      returnDate: this.newFlightForm.get('returnDate')?.value,
      departureDate: this.newFlightForm.get('departureDate')?.value,
      airport: this.newFlightForm.get('airport')?.value,
      airways: this.newFlightForm.get('airways')?.value,
      moreInfo: this.newFlightForm.get('moreInfo')?.value,
      price: this.newFlightForm.get('price')?.value,
    }
    this.SFlight.addFlight(this.NewFlight)
  }


}
