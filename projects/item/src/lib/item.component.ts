import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

import { Flights } from 'src/app/interfaces/flight.interface';
import { Hotel } from 'src/app/interfaces/hotel.interface';

@Component({
  selector: 'item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent implements OnInit {

  @Input() sub_image?: string;
  @Input() item_type?: string = '';

  // flight
  @Input() flight?: Flights;
  @Input() hotel?: Hotel;

  @Output() chosenFlight: EventEmitter<Hotel> = new EventEmitter();
  @Output() chosenHotel: EventEmitter<Hotel> = new EventEmitter();

  constructor() { 
   
  }

  ngOnInit(): void {
   
  }

  onChosenHotel(chosenHotel: Hotel){
    this.chosenHotel.emit(chosenHotel)
  }

  onChosenFlight(chosenFlight: Flights){
    this.chosenFlight.emit(chosenFlight)
  }

}
