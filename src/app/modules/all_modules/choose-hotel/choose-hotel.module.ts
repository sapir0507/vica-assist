import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChooseHotelRoutingModule } from './choose-hotel-routing.module';
import { ChooseHotelComponent } from './choose-hotel.component';
import { ItemModule } from 'projects/item/src/item';


@NgModule({
  declarations: [
    ChooseHotelComponent
  ],
  imports: [
    CommonModule,
    ItemModule,
    ChooseHotelRoutingModule
  ],
  exports:[
    ChooseHotelComponent
  ]
})
export class ChooseHotelModule { }
