
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyFlightsComponent } from './my-flights.component';

import { MyFlightsService } from './my-flights.service';





@NgModule({
  declarations: [
    MyFlightsComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  providers:[
    MyFlightsService
  ],
  exports: [
    MyFlightsComponent
  ]
})
export class MyFlightsModule { }
