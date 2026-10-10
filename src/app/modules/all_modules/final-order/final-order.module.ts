import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinalOrderRoutingModule } from './final-order-routing.module';
import { FinalOrderComponent } from './final-order.component';
import { UserFinishedOrderModule } from '../user-finished-order/user-finished-order.module';
import { ChooseFlightModule } from '../choose-flight/choose-flight.module';
import { ChooseHotelModule } from '../choose-hotel/choose-hotel.module';
import { MatTabsModule } from '@angular/material/tabs';



@NgModule({
  declarations: [
    FinalOrderComponent
  ],
  imports: [
    CommonModule,
    MatTabsModule,

    ChooseFlightModule,
    ChooseHotelModule,
    FinalOrderRoutingModule,
    UserFinishedOrderModule
  ],
  exports:[
    FinalOrderComponent
  ]
})
export class FinalOrderModule { }
