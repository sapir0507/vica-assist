import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddNewHotelRoutingModule } from './add-new-hotel-routing.module';
import { AddNewHotelComponent } from './add-new-hotel.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AddNewHotelComponent
  ],
  imports: [
    CommonModule,
    AddNewHotelRoutingModule,
    ReactiveFormsModule
  ],
  exports:[
    AddNewHotelComponent
  ]
})
export class AddNewHotelModule { }
