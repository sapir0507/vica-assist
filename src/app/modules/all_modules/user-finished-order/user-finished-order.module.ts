import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserFinishedOrderComponent } from './user-finished-order/user-finished-order.component';
import { userFinishedOrderRoutingModule } from './user-finished-order-routing.module';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [
    UserFinishedOrderComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    userFinishedOrderRoutingModule
  ],
  exports:[
    UserFinishedOrderComponent
  ]
})
export class UserFinishedOrderModule { }
