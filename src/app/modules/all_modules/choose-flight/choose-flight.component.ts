import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ItemType } from '@vica-assist/item';
// import { MyFlightsService } from '@vica-assist/my-flights';
import { Observable } from 'rxjs';
import { Flights } from '@vica-assist/shared';
import { SflightService } from 'src/app/services/flight/sflight.service';

@Component({
  standalone: false,
  selector: 'app-choose-flight',
  templateUrl: './choose-flight.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChooseFlightComponent implements OnInit {
    readonly ItemType = ItemType;
    @Output() chosenFlight: EventEmitter<Flights> = new EventEmitter();
    @Input() orderID: string | null = null; //to find all flights with coresponding orderIDs
    _ALLFlights$: Observable<Flights[]> | null= null;

  constructor(
    private SFlight: SflightService,
    // private flight: MyFlightsService
  ) {
    
  }

  ngOnInit(): void {
    const id = this.orderID? +this.orderID : 1;
    this._ALLFlights$ = this.SFlight.getFlight(id);
  }

  onChosenFlight(chosenFlight: Flights){
    this.chosenFlight.emit(chosenFlight)
  }

}
