import { Component, ChangeDetectionStrategy } from '@angular/core';


@Component({
  standalone: false,
  selector: 'app-add-new-flight',
  templateUrl: './add-new-flight.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddNewFlightComponent {
  
  constructor() { /* empty*/}

}
