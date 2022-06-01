import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
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
  
    notifier: Subject<boolean> = new Subject();
    @Input() orderID: number = 1;
    _ALLFlights$: Observable<Flights[]> = this.SFlight.getFlight(this.orderID);

  constructor(private SFlight: SflightService) {
    this._ALLFlights$
    .pipe(
      takeUntil(this.notifier)
    )
    .subscribe()
  }

  ngOnDestroy(): void {
      this.notifier.next(true)
      this.notifier.complete()
  }

}
