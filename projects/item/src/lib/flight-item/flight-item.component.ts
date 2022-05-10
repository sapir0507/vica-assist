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

  @Input() flight?: Flights;

  constructor() { }

  ngOnInit(): void {
    // this.stops='one stop';
    console.log("flight --> ", this.flight)
  }

}
