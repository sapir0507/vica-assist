import { Component, OnInit } from '@angular/core';
import { HotelsService } from 'projects/all-services/src/lib/hotels.service';
import { Hotel } from 'projects/all-the-interfaces/src/lib/hotel.interface';
import { Observable } from 'rxjs';


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
