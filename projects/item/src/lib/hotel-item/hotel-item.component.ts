import { Component, Input, OnInit } from '@angular/core';
import { Hotel } from 'src/app/interfaces/hotel.interface';

@Component({
  selector: 'hotel-item',
  templateUrl: './hotel-item.component.html',
  styleUrls: ['./hotel-item.component.scss']
})
export class HotelItemComponent implements OnInit {

  constructor() { }

  @Input() hotel: Hotel | null = null;
  currentRate = 5;
  private path: string = 'assets/images/img/';
  private my_images = [
    'bed.png', 
    'bedroom.png', 
    'bg_bggenerator_com.png'
  ];
  images = this.getImages();
  
  ngOnInit(): void {
  }

  getBad(): number{
    let stars = 5;
    this.hotel && this.hotel.stars ? stars = this.hotel.stars : stars = 5;
    return stars;
  }

  getImages(){
    return this.my_images.map(image=> this.path + image)
  }

}
