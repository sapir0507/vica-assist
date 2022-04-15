import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChooseHotelComponent } from './choose-hotel.component';

const routes: Routes = [{
  path:'', 
  component: ChooseHotelComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChooseHotelRoutingModule { }
