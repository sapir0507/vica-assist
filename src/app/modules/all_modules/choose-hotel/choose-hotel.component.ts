import { Component, OnInit } from '@angular/core';
import { HotelsService } from 'projects/my-hotels/src/lib/my-hotels/hotels.service';
// import { HotelsService } from 'projects/all-services/src/lib/hotels.service';
import { Observable } from 'rxjs';
import { Hotel } from 'src/app/interfaces/hotel.interface';


@Component({
  selector: 'app-choose-hotel',
  templateUrl: './choose-hotel.component.html',
  styleUrls: ['./choose-hotel.component.scss']
})
export class ChooseHotelComponent implements OnInit {

  AllHotels: Hotel[] = [];
  private _AllHotels$: Observable<Hotel[]> = this.SHotel.getHotels();

  constructor(private SHotel: HotelsService) {
    const allHotels = this._AllHotels$.subscribe(
      hotel => {
        hotel.forEach(item => {
          console.log(item)
          this.AllHotels = [...this.AllHotels, item]
        })
      }
    )
   }

  ngOnInit(): void {
  }

}
