import { Component, Input, OnInit } from '@angular/core';
import { MyFlightsComponent } from 'myFlights';
import { Flights } from 'src/app/interfaces/flight.interface';

@Component({
  selector: 'flight-item',
  templateUrl: './flight-item.component.html',
  styleUrls: ['./flight-item.component.scss']
})
export class FlightItemComponent implements OnInit {
  @Input() label?: string;

  @Input() flight: Flights = {id: 1};


  constructor() { }

  ngOnInit(): void {
    // this.stops='one stop';
    
  }

}
