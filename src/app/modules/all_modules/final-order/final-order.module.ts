import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinalOrderRoutingModule } from './final-order-routing.module';
import { FinalOrderComponent } from './final-order.component';


@NgModule({
  declarations: [
    FinalOrderComponent
  ],
  imports: [
    CommonModule,
    FinalOrderRoutingModule
  ],
  exports:[
    FinalOrderComponent
  ]
})
export class FinalOrderModule { }
