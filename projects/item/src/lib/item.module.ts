import { NgModule } from '@angular/core';
import { ItemComponent } from './item.component';
import { MatCardModule } from '@angular/material/card'
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
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
    MatCardModule,
    MatIconModule
  ],
  exports: [
    ItemComponent
  ]
})
export class ItemModule { }
