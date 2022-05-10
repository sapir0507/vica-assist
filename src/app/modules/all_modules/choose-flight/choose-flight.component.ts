import { Component, Input, OnInit, Output } from '@angular/core';
import { Flights } from 'projects/all-the-interfaces/src/lib/flight.interface';
import { Observable, Subscription } from 'rxjs';
import { IFlight } from 'src/app/services/flight/iflight';
import { SflightService } from 'src/app/services/flight/sflight.service';

@Component({
  selector: 'app-choose-flight',
  templateUrl: './choose-flight.component.html',
  styleUrls: ['./choose-flight.component.scss']
})
export class ChooseFlightComponent implements OnInit {
  
   AllFlights: Flights[] = []
   private _ALLFlights$: Observable<Flights> = this.SFlight.getFlights();

  constructor(private SFlight: SflightService) {
    const allFlights = this._ALLFlights$.subscribe(flight => {
      this.AllFlights = [...this.AllFlights, flight]
    })
   
  }

  ngOnInit(): void {
  }

}
