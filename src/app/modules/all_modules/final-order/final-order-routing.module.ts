import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinalOrderComponent } from './final-order.component';

const routes: Routes = [{
  path:'',
  component: FinalOrderComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinalOrderRoutingModule { }
