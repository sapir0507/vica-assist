import { Component, Input, OnInit, Output } from '@angular/core';
import { Iflight } from 'src/app/services/flight/iflight';
import { SflightService } from 'src/app/services/flight/sflight.service';

@Component({
  selector: 'app-choose-flight',
  templateUrl: './choose-flight.component.html',
  styleUrls: ['./choose-flight.component.scss']
})
export class ChooseFlightComponent implements OnInit {
   AllFlights: Iflight[] | null = this.SFlight.flightsArray;
  constructor(private SFlight: SflightService) {
    // console.log(this.SFlight.FLIGHTS)
  }

  ngOnInit(): void {
  }

}
