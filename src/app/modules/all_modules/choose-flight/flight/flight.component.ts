import { Component, Input, OnInit } from '@angular/core';
import { IFlight } from 'src/app/services/flight/iflight';

@Component({
  selector: 'app-flight',
  templateUrl: './flight.component.html',
  styleUrls: ['./flight.component.scss']
})
export class FlightComponent implements OnInit {
  @Input() flight: IFlight | null = null;
  constructor() { }

  ngOnInit(): void {
  }

}
