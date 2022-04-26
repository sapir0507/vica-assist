import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyHotelsRoutingModule } from './my-hotels-routing.module';
import { MyHotelsComponent } from './my-hotels.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MyHotelsService } from './my-hotels.service';
// import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    MyHotelsComponent
  ],
  imports: [
    CommonModule,
    MatNativeDateModule,
    MatRippleModule,
    MatSliderModule,
    MatIconModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MyHotelsRoutingModule
  ],
  exports:[
    MyHotelsComponent
  ],
  providers:[
    MyHotelsService
  ]
})
export class MyHotelsModule { }
