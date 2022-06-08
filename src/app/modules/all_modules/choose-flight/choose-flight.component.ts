import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Flights } from 'src/app/interfaces/flight.interface';
import { SflightService } from 'src/app/services/flight/sflight.service';

@Component({
  selector: 'app-choose-flight',
  templateUrl: './choose-flight.component.html',
  styleUrls: ['./choose-flight.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChooseFlightComponent implements OnDestroy{
  
    @Output() chosenFlight: EventEmitter<Flights> = new EventEmitter();
    notifier: Subject<boolean> = new Subject();
    @Input() orderID: number = 1; //to find all flights with coresponding orderIDs
    _ALLFlights$: Observable<Flights[]> = this.SFlight.getFlight(this.orderID);

  constructor(
    private SFlight: SflightService
  ) {
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
