import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserFinishedOrderComponent } from './user-finished-order/user-finished-order.component';
import { userFinishedOrderRoutingModule } from './user-finished-order-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [
    UserFinishedOrderComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    userFinishedOrderRoutingModule
  ],
  exports:[
    UserFinishedOrderComponent
  ]
})
export class UserFinishedOrderModule { }
