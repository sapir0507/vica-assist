import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChooseHotelRoutingModule } from './choose-hotel-routing.module';
import { ChooseHotelComponent } from './choose-hotel.component';
import { ItemModule } from 'projects/item/src/item';
import { UserRequestsModule } from '../user-requests/user-requests.module';


@NgModule({
  declarations: [
    ChooseHotelComponent
  ],
  imports: [
    CommonModule,
    ItemModule,
    UserRequestsModule,
    ChooseHotelRoutingModule
  ],
  exports:[
    ChooseHotelComponent
  ]
})
export class ChooseHotelModule { }
