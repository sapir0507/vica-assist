import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
// import { MyFlightsService } from 'projects/my-flights/src';
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
    const id: number = this.orderID? +this.orderID : 1;
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
