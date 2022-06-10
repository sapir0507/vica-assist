import { outputAst } from '@angular/compiler';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
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
  @Input() orderID: string | null = null; //to find all flights with coresponding orderIDs
  _allHotels$: Observable<Hotel[]> | null = null
  @Output() chosenHotel: EventEmitter<Hotel> = new EventEmitter();

  constructor(private SHotel: HotelsService) {
    
   }

  ngOnInit(): void {
    const id: number = this.orderID? +this.orderID : 1;
    this._allHotels$ = this.SHotel.getHotelsByOrderID(id);
    const allHotels = this._allHotels$
    .pipe(
      takeUntil(this.notifier)
    )
    .subscribe()

  }

  ngOnDestroy(): void {
      this.notifier.next(true)
      this.notifier.complete()
  }

  onChooseHotel(chosenHotel: Hotel){
    this.chosenHotel.emit(chosenHotel);
  }
}
