import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent implements OnInit {

  @Input() sub_image?: string;
  @Input() item_type?: string = 'flight';

  // flight
  @Input() origin?: string = 'Israel';
  @Input() destination?: string = 'Hungry';
  @Input() passangers?: string = '2';
  @Input() stops?: string = 'no stops';
  @Input() departureDate?: string = '17/7/22';
  @Input() returnDate?: string = '22/8/22';
  @Input() bagage?: boolean = true;

  //hotel
  @Input() name?: string;
  @Input() stars?: number;
  @Input() guests?: string;
  @Input() bedType?: string;
  @Input() breakfast?: boolean;

  @Input() moreInfo?: string;
  @Input() price?: string = "220";

  constructor() { }

  ngOnInit(): void {
    console.log(this.item_type)
  }

}
