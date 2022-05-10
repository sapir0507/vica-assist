import { Component, Input, OnInit } from '@angular/core';
import { MyFlightsComponent } from 'myFlights';
import { Flights } from 'projects/all-the-interfaces/src/lib/flight.interface';

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
