import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddNewFlightRoutingModule } from './add-new-flight-routing.module';
import { AddNewFlightComponent } from './add-new-flight.component';
import { MyFlightsModule } from 'projects/my-flights/src/public-api';


@NgModule({
  declarations: [
    AddNewFlightComponent
  ],
  imports: [
    CommonModule,
    AddNewFlightRoutingModule,
    MyFlightsModule
  ],
  exports:[
    AddNewFlightComponent
  ]
})
export class AddNewFlightModule { }
