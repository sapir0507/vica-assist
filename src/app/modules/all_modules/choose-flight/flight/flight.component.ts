import { Component, Input, OnInit } from '@angular/core';
import { Flights } from 'src/app/interfaces/flight.interface';

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
