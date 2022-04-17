import { Component, Input, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Iflight } from 'src/app/services/flight/iflight';
import { SflightService } from 'src/app/services/flight/sflight.service';

@Component({
  selector: 'app-choose-flight',
  templateUrl: './choose-flight.component.html',
  styleUrls: ['./choose-flight.component.scss']
})
export class ChooseFlightComponent implements OnInit {
  
   AllFlights: Iflight[] = []
   private _ALLFlights$: Observable<Iflight> = this.SFlight.getFlights();

  constructor(private SFlight: SflightService) {
    const allFlights = this._ALLFlights$.subscribe(flight => {
      this.AllFlights = [...this.AllFlights, flight]
    })
   
  }

  ngOnInit(): void {
  }

}
