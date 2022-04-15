import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddNewHotelComponent } from './add-new-hotel.component';

const routes: Routes = [{
  path: '',
  component: AddNewHotelComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddNewHotelRoutingModule { }
