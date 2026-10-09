import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { Hotel } from '@vica-assist/shared';

@Component({
  standalone: false,
  selector: 'hotel-item',
  templateUrl: './hotel-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./hotel-item.component.scss']
})
export class HotelItemComponent implements OnInit {

  constructor() { /* empty */}

  @Input() hotel: Hotel | null = null;
  @Output() chosenHotel: EventEmitter<Hotel> = new EventEmitter()
  currentRate = 5;
  private path = 'assets/images/img/';
  private my_images = [
    'bed.png', 
    'bedroom.png', 
    'bg_bggenerator_com.png'
  ];
  
  images = this.getImages();
  
  ngOnInit(): void {/* empty */}

  getBad(): number{
    let stars = 5;
    stars = this.hotel && this.hotel.stars ? this.hotel.stars : 5;
    return stars;
  }

  getImages(){
    return this.my_images.map(image=> this.path + image)
  }

  onChosen(chosenHotel: Hotel){
    this.chosenHotel.emit(chosenHotel)
  }

}
