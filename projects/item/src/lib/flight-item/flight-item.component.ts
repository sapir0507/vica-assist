import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { MyFlightsComponent } from 'myFlights';
import { Flights } from 'src/app/interfaces/flight.interface';

@Component({
  selector: 'flight-item',
  templateUrl: './flight-item.component.html',
  styleUrls: ['./flight-item.component.scss']
})
export class FlightItemComponent implements OnInit {
  @Input() label?: string;


  @Input() flight: Flights | null = null;


  constructor() { }

  ngOnInit(): void {
    // this.stops='one stop';
    
  }

}
