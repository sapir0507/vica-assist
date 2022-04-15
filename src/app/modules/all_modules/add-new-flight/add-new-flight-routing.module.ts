import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddNewFlightComponent } from './add-new-flight.component';

const routes: Routes = [{
  path:'',
  component: AddNewFlightComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddNewFlightRoutingModule { }
