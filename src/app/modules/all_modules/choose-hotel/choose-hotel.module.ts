import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChooseHotelRoutingModule } from './choose-hotel-routing.module';
import { ChooseHotelComponent } from './choose-hotel.component';
import { HotelComponent } from './hotel/hotel.component';


@NgModule({
  declarations: [
    ChooseHotelComponent,
    HotelComponent
  ],
  imports: [
    CommonModule,
    ChooseHotelRoutingModule
  ],
  exports:[
    ChooseHotelComponent
  ]
})
export class ChooseHotelModule { }
