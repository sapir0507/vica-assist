import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ItemType } from '@vica-assist/item';
import { HotelsService } from '@vica-assist/my-hotels';
// import { HotelsService } from 'projects/all-services/src/lib/hotels.service';
import { Observable } from 'rxjs';
import { Hotel, Order } from '@vica-assist/shared';


@Component({
  standalone: false,
  selector: 'app-choose-hotel',
  templateUrl: './choose-hotel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChooseHotelComponent implements OnInit {
    readonly ItemType = ItemType;
  @Input() order?: Order | null; //the customer's request, to compare the offers with
  @Input() orderID: string | null = null; //to find all flights with coresponding orderIDs
  _allHotels$: Observable<Hotel[]> | null = null
  @Output() chosenHotel: EventEmitter<Hotel> = new EventEmitter();

  constructor(private SHotel: HotelsService) {
    
   }

  ngOnInit(): void {
    const id = this.orderID? +this.orderID : 1;
    this._allHotels$ = this.SHotel.getHotelsByOrderID(id);
  }

  onChooseHotel(chosenHotel: Hotel){
    this.chosenHotel.emit(chosenHotel);
  }
}
