import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChooseFlightComponent } from './choose-flight.component';

const routes: Routes = [{
  path: '',
  component: ChooseFlightComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChooseFlightRoutingModule { }
