import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserFinishedOrderComponent } from './user-finished-order/user-finished-order.component';



@NgModule({
  declarations: [
    UserFinishedOrderComponent
  ],
  imports: [
    CommonModule
  ],
  exports:[
    UserFinishedOrderComponent
  ]
})
export class UserFinishedOrderModule { }
