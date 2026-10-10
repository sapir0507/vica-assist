import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';

import { ItemComponent } from './item.component';
import { FlightItemComponent } from './flight-item/flight-item.component';
import { HotelItemComponent } from './hotel-item/hotel-item.component';

@NgModule({
  declarations: [
    ItemComponent,
    FlightItemComponent,
    HotelItemComponent,
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
    NgbRatingModule
  ],
  exports: [
    ItemComponent
  ]
})
export class ItemModule { }
