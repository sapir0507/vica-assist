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
