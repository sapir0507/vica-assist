import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ItemType } from '@vica-assist/item';
import { HotelsService } from '@vica-assist/my-hotels';
// import { HotelsService } from 'projects/all-services/src/lib/hotels.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Hotel } from '@vica-assist/shared';


@Component({
  standalone: false,
  selector: 'app-choose-hotel',
  templateUrl: './choose-hotel.component.html',
  styleUrls: ['./choose-hotel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChooseHotelComponent implements OnInit, OnDestroy {
    readonly ItemType = ItemType;
  notifier: Subject<boolean> = new Subject();
  @Input() orderID: string | null = null; //to find all flights with coresponding orderIDs
  _allHotels$: Observable<Hotel[]> | null = null
  @Output() chosenHotel: EventEmitter<Hotel> = new EventEmitter();

  constructor(private SHotel: HotelsService) {
    
   }

  ngOnInit(): void {
    const id = this.orderID? +this.orderID : 1;
    this._allHotels$ = this.SHotel.getHotelsByOrderID(id);
    this._allHotels$
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
