import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-add-new-hotel',
  templateUrl: './add-new-hotel.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./add-new-hotel.component.scss']
})
export class AddNewHotelComponent {

  constructor() { /* empty*/}
}
