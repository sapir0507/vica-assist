import { Component, Input, OnInit } from '@angular/core';
import { Hotel } from 'projects/all-the-interfaces/src/lib/hotel.interface';

@Component({
  selector: 'hotel-item',
  templateUrl: './hotel-item.component.html',
  styleUrls: ['./hotel-item.component.scss']
})
export class HotelItemComponent implements OnInit {

  constructor() { }

  @Input() hotel: Hotel = {id: 1};
  currentRate = 5;
  private path: string = 'assets/images/img';
  images = ['assets/images/img/bed.png', 'assets/images/img/bedroom.png', 'assets/images/img/bg_bggenerator_com.png'];
  ngOnInit(): void {
  }

  getBad(): number{
    let stars = 5;
    this.hotel && this.hotel.stars ? stars = this.hotel.stars : stars = 5;
    return stars;
  }

}
