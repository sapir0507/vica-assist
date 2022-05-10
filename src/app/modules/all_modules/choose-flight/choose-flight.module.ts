import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChooseFlightRoutingModule } from './choose-flight-routing.module';
import { ChooseFlightComponent } from './choose-flight.component';
import { FlightComponent } from './flight/flight.component';
import { ItemModule } from 'projects/item/src/item';
import { AllTheInterfacesModule } from 'projects/all-the-interfaces/src';



@NgModule({
  declarations: [
    ChooseFlightComponent,
    FlightComponent
  ],
  imports: [
    CommonModule,
    ChooseFlightRoutingModule,
    AllTheInterfacesModule,
    ItemModule
  ],
  exports:[
    ChooseFlightComponent
  ]
})
export class ChooseFlightModule { }
