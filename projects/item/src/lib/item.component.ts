import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Flights } from 'projects/all-the-interfaces/src/lib/flight.interface';
import { Hotel } from 'projects/all-the-interfaces/src/lib/hotel.interface';

@Component({
  selector: 'item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent implements OnInit {

  @Input() sub_image?: string;
  @Input() item_type?: string = '';

  // flight
  @Input() flight?: Flights;
  @Input() hotel?: Hotel;

  // @Input() origin?: string = 'Israel';
  // @Input() destination?: string = 'Hungry';
  // @Input() passangers?: string = '2';
  // @Input() stops?: string = 'no stops';
  // @Input() departureDate?: string = '17/7/22';
  // @Input() returnDate?: string = '22/8/22';
  // @Input() bagage?: boolean = true;

  //hotel
  // @Input() name?: string;
  // @Input() stars?: number;
  // @Input() guests?: string;
  // @Input() bedType?: string;
  // @Input() breakfast?: boolean;

  // @Input() moreInfo?: string;
  // @Input() price?: string = "220";

  constructor() { 
    console.log("library -> item")
  }

  ngOnInit(): void {
    console.log("lib --> item")
    console.log("item type:", this.item_type)
    console.log("Flight: ", this.flight)
    console.log("Hotel: ", this.hotel)
  }

}
