import { Component, OnInit } from '@angular/core';
// import { FormGroup, FormControl } from '@angular/forms';
// import { IFlight, IFlightRequest } from 'src/app/services/flight/iflight';
// import { SflightService } from 'src/app/services/flight/sflight.service';

@Component({
  selector: 'app-add-new-flight',
  templateUrl: './add-new-flight.component.html',
  styleUrls: ['./add-new-flight.component.scss']
})
export class AddNewFlightComponent implements OnInit {

  // newFlightForm = new FormGroup({
  //   flightDest: new FormControl(''),
  //   flightPassangers: new FormControl(''),
  //   flightOrg: new FormControl(''),
  //   flightReturn: new FormControl(''),
  //   flightDeparture: new FormControl(''),
  //   flightAirport: new FormControl(''),
  //   flightAirways: new FormControl(''),
  //   flightInfo: new FormControl(''),
  //   flightPrice: new FormControl('')
  // });

  // NewFlight: IFlightRequest | null = null;
  
  constructor(
    // private SFlight: SflightService
    ) {
    
   }

  ngOnInit(): void {
  }

  // addFlight(){
  //   console.log('addFlight -> component')
  //   this.NewFlight = {
  //     Dest:this.newFlightForm.get('flightDest')?.value,
  //     Passangers: this.newFlightForm.get('flightPassangers')?.value,
  //     Org: this.newFlightForm.get('flightOrg')?.value,
  //     Return: this.newFlightForm.get('flightReturn')?.value,
  //     Departure: this.newFlightForm.get('flightDeparture')?.value,
  //     Airport: this.newFlightForm.get('flightAirport')?.value,
  //     Airways: this.newFlightForm.get('flightAirways')?.value,
  //     Info: this.newFlightForm.get('flightInfo')?.value,
  //     Price: this.newFlightForm.get('flightPrice')?.value,
  //   }
  //   this.SFlight.addFlight(this.NewFlight)
  // }

}
