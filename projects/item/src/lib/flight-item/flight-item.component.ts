import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'flight-item',
  templateUrl: './flight-item.component.html',
  styleUrls: ['./flight-item.component.scss']
})
export class FlightItemComponent implements OnInit {
  @Input() origin?: string = 'Israel';
  @Input() destination?: string = 'Hungry';
  @Input() passangers?: string = '2';
  @Input() fullName?: string;
  @Input() myID?: number;
  @Input() allFullName?: string[];
  @Input() allMyID?: number;
  @Input() stops?: string = 'no stops';
  @Input() departureDate?: string = '17/7/22';
  @Input() returnDate?: string = '22/8/22';
  @Input() bagage?: boolean = true;
  constructor() { }

  ngOnInit(): void {
  }

}
