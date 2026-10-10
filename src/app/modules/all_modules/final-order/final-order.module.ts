import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinalOrderRoutingModule } from './final-order-routing.module';
import { FinalOrderComponent } from './final-order.component';
import { UserFinishedOrderModule } from '../user-finished-order/user-finished-order.module';
import { ChooseFlightModule } from '../choose-flight/choose-flight.module';
import { ChooseHotelModule } from '../choose-hotel/choose-hotel.module';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { ItemModule } from '@vica-assist/item';



@NgModule({
  declarations: [
    FinalOrderComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,

    ChooseFlightModule,
    ChooseHotelModule,
    ItemModule, //should i really?
    FinalOrderRoutingModule,
    UserFinishedOrderModule
  ],
  exports:[
    FinalOrderComponent
  ]
})
export class FinalOrderModule { }
