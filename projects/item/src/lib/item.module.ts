import { NgModule } from '@angular/core';
import { ItemComponent } from './item.component';
import { MatCardModule } from '@angular/material/card'
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FlightItemComponent } from './flight-item/flight-item.component';
import { HotelItemComponent } from './hotel-item/hotel-item.component';
import { MyPipesModule } from 'projects/my-pipes/src';
import { AllTheInterfacesModule } from 'projects/all-the-interfaces/src';





@NgModule({
  declarations: [
    ItemComponent,
    FlightItemComponent,
    HotelItemComponent,
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MyPipesModule,
    AllTheInterfacesModule
  ],
  exports: [
    ItemComponent
  ]
})
export class ItemModule { }
