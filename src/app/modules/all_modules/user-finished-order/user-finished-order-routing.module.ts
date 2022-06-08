import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserFinishedOrderComponent } from './user-finished-order/user-finished-order.component';


const routes: Routes = [{
  path:'', 
  component: UserFinishedOrderComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class userFinishedOrderRoutingModule { }
