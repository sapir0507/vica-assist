import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Flights } from 'projects/all-the-interfaces/src/lib/flight.interface';
import { Observable } from 'rxjs';
import { SflightService } from 'src/app/services/flight/sflight.service';

@Component({
  selector: 'app-choose-flight',
  templateUrl: './choose-flight.component.html',
  styleUrls: ['./choose-flight.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChooseFlightComponent implements OnInit {
  
   AllFlights: Flights[] = []
   private _ALLFlights$: Observable<Flights[]> = this.SFlight.getFlights();

  constructor(private SFlight: SflightService) {
    const allFlights = this._ALLFlights$.subscribe(flight => {
      flight.forEach(item => {
        console.log("item", item)
        // this.AllFlights.push(item)
        this.AllFlights = [...this.AllFlights, item]
      });
      
    })
  }

  ngOnInit(): void {
  }

}
