import { Component, OnInit } from '@angular/core';
import { Ihotel } from 'src/app/services/hotel/ihotel';
import { ShotelService } from 'src/app/services/hotel/shotel.service';

@Component({
  selector: 'app-choose-hotel',
  templateUrl: './choose-hotel.component.html',
  styleUrls: ['./choose-hotel.component.scss']
})
export class ChooseHotelComponent implements OnInit {
  stars: boolean[] = [true, false, false, false, false]
  urlWhite: string = "https://thecolor.blog/wp-content/uploads/2021/02/Amarillo-Canario.png"
  urlYellow: string = "https://www.macmillandictionary.com/external/slideshow/full/White_full.png"
  AllHotels: Ihotel[] | null = this.SHotel.HOTELS;

  constructor(private SHotel: ShotelService) {

   }

  ngOnInit(): void {
    this.AllHotels? this.AllHotels = this.SHotel.HOTELS : this.AllHotels = [{
      hotelID: 0,
      hotelName: "heavens high",
      hotelStarNum: 5,
      hotelBreakfast: "included",
      hotelBeds: "Queen Bed",
      hotelPrice: 360
   }]
  }

  getColorForImg(id: number){
    return this.stars[id] === true? this.urlWhite :this.urlYellow 
  }

  toggleColor(num: number){
    for(let i = 0; i< 5; i++){
      i <= num? this.stars[i] = true : this.stars[i] = false;
    }
  }

}
