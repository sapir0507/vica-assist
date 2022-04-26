import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddNewHotelRoutingModule } from './add-new-hotel-routing.module';
import { AddNewHotelComponent } from './add-new-hotel.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MyHotelsModule } from 'projects/my-hotels/src/lib/my-hotels/my-hotels.module';


@NgModule({
  declarations: [
    AddNewHotelComponent
  ],
  imports: [
    CommonModule,
    MyHotelsModule,
    AddNewHotelRoutingModule,
    ReactiveFormsModule
  ],
  exports:[
    AddNewHotelComponent
  ]
})
export class AddNewHotelModule { }
