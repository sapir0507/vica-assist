import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
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
    _ALLFlights$: Observable<Flights[]> = this.SFlight.getFlights();

  constructor(private SFlight: SflightService) {
    const allFlights = this._ALLFlights$
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
