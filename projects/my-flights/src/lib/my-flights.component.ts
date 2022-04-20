import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { IFlightRequest } from './my-flights.interface';
import { MyFlightsService } from './my-flights.service';


@Component({
  selector: 'lib-myFlights',
  templateUrl: './my-flights.component.html',
  styleUrls: ['./my-flights.component.scss']
})
export class MyFlightsComponent implements OnInit {

  newFlightForm = new FormGroup({
    Dest: new FormControl(''),
    Passangers: new FormControl(''),
    Org: new FormControl(''),
    Return: new FormControl(''),
    Departure: new FormControl(''),
    Airport: new FormControl(''),
    Airways: new FormControl(''),
    Info: new FormControl(''),
    Price: new FormControl('')
  });

  NewFlight: IFlightRequest | null = null;
  constructor(private SFlight: MyFlightsService) { 
    console.log('library');
  }

  ngOnInit(): void {
  }

  
  addFlight(){
    console.log('addFlight -> library')
    this.NewFlight = {
      Dest: this.newFlightForm.get('Dest')?.value,
      Passangers: this.newFlightForm.get('Passangers')?.value,
      Org: this.newFlightForm.get('Org')?.value,
      Return: this.newFlightForm.get('Return')?.value,
      Departure: this.newFlightForm.get('Departure')?.value,
      Airport: this.newFlightForm.get('Airport')?.value,
      Airways: this.newFlightForm.get('Airways')?.value,
      Info: this.newFlightForm.get('Info')?.value,
      Price: this.newFlightForm.get('Price')?.value,
    }
    this.SFlight.addFlight(this.NewFlight)
  }

}
