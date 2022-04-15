import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AddNewFlightRoutingModule } from './add-new-flight-routing.module';
import { AddNewFlightComponent } from './add-new-flight.component';

@NgModule({
  declarations: [
    AddNewFlightComponent
  ],
  imports: [
    CommonModule,
    AddNewFlightRoutingModule,
    ReactiveFormsModule
  ],
  exports:[
    AddNewFlightComponent
  ]
})
export class AddNewFlightModule { }
