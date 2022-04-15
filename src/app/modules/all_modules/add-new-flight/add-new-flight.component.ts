import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Iflight } from 'src/app/services/flight/iflight';
import { SflightService } from 'src/app/services/flight/sflight.service';

@Component({
  selector: 'app-add-new-flight',
  templateUrl: './add-new-flight.component.html',
  styleUrls: ['./add-new-flight.component.scss']
})
export class AddNewFlightComponent implements OnInit {

  newFlightForm = new FormGroup({
    flightDest: new FormControl(''),
    flightPassangers: new FormControl(''),
    flightOrg: new FormControl(''),
    flightReturn: new FormControl(''),
    flightDeparture: new FormControl(''),
    flightAirport: new FormControl(''),
    flightAirways: new FormControl(''),
    flightInfo: new FormControl(''),
    flightPrice: new FormControl('')
  });

  NewFlight: Iflight | null = null;
  
  constructor(private SFlight: SflightService) {
    
   }

  ngOnInit(): void {
  }

  addFlight(){
    console.log('addFlight -> component')
    this.NewFlight = {
      flightID: this.SFlight.getNewID(),
      flightDest:this.newFlightForm.get('flightDest')?.value,
      flightPassangers: this.newFlightForm.get('flightPassangers')?.value,
      flightOrg: this.newFlightForm.get('flightOrg')?.value,
      flightReturn: this.newFlightForm.get('flightReturn')?.value,
      flightDeparture: this.newFlightForm.get('flightDeparture')?.value,
      flightAirport: this.newFlightForm.get('flightAirport')?.value,
      flightAirways: this.newFlightForm.get('flightAirways')?.value,
      flightInfo: this.newFlightForm.get('flightInfo')?.value,
      flightPrice: this.newFlightForm.get('flightPrice')?.value,
    }
    this.SFlight.addFlight(this.NewFlight)
  }

}
