import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { HotelsService } from 'projects/my-hotels/src/lib/my-hotels/hotels.service';
// import { HotelsService } from 'projects/all-services/src/lib/hotels.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Hotel } from 'src/app/interfaces/hotel.interface';


@Component({
  selector: 'app-choose-hotel',
  templateUrl: './choose-hotel.component.html',
  styleUrls: ['./choose-hotel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChooseHotelComponent implements OnInit, OnDestroy {

  notifier: Subject<boolean> = new Subject();
  _allHotels$: Observable<Hotel[]> = this.SHotel.getHotels();

  constructor(private SHotel: HotelsService) {
    const allHotels = this._allHotels$
    .pipe(
      takeUntil(this.notifier)
    )
    .subscribe()
   }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
      this.notifier.next(true)
      this.notifier.complete()
  }
}
