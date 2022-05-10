import { Component, Input, OnInit } from '@angular/core';
import { Flights } from 'projects/all-the-interfaces/src/lib/flight.interface';

@Component({
  selector: 'app-flight',
  templateUrl: './flight.component.html',
  styleUrls: ['./flight.component.scss']
})
export class FlightComponent implements OnInit {
  @Input() flight: Flights | null = null;
  constructor() { }

  ngOnInit(): void {
  }

}
