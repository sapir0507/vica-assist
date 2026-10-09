import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { ItemType } from '@vica-assist/item';
// import { MyFlightsService } from '@vica-assist/my-flights';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Flights } from '@vica-assist/shared';
import { SflightService } from 'src/app/services/flight/sflight.service';

@Component({
  standalone: false,
  selector: 'app-choose-flight',
  templateUrl: './choose-flight.component.html',
  styleUrls: ['./choose-flight.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChooseFlightComponent implements OnDestroy{
    readonly ItemType = ItemType;
    @Output() chosenFlight: EventEmitter<Flights> = new EventEmitter();
    notifier: Subject<boolean> = new Subject();
    @Input() orderID: string | null = null; //to find all flights with coresponding orderIDs
    _ALLFlights$: Observable<Flights[]> | null= null;

  constructor(
    private SFlight: SflightService,
    // private flight: MyFlightsService
  ) {
    
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    const id = this.orderID? +this.orderID : 1;
    this._ALLFlights$ = this.SFlight.getFlight(id);
    this._ALLFlights$
    .pipe(
      takeUntil(this.notifier)
    )
    .subscribe()
  }

  onChosenFlight(chosenFlight: Flights){
    this.chosenFlight.emit(chosenFlight)
  }

  ngOnDestroy(): void {
      this.notifier.next(true)
      this.notifier.complete()
  }

}
