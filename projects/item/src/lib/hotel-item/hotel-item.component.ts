import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'hotel-item',
  templateUrl: './hotel-item.component.html',
  styleUrls: ['./hotel-item.component.scss']
})
export class HotelItemComponent implements OnInit {

  constructor() { }
  @Input() name?: string;
  @Input() stars?: number;
  @Input() guests?: string;
  @Input() bedType?: string;
  @Input() breakfast?: boolean;

  ngOnInit(): void {
  }

}
