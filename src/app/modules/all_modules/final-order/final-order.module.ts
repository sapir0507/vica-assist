import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinalOrderRoutingModule } from './final-order-routing.module';
import { FinalOrderComponent } from './final-order.component';
import { UserFinishedOrderModule } from '../user-finished-order/user-finished-order.module';
import { ChooseFlightModule } from '../choose-flight/choose-flight.module';
import { ChooseHotelModule } from '../choose-hotel/choose-hotel.module';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';



@NgModule({
  declarations: [
    FinalOrderComponent
  ],
  imports: [
    CommonModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatSortModule,

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
