import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyFlightsComponent } from './my-flights.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDividerModule} from '@angular/material/divider';


@NgModule({
  declarations: [
    MyFlightsComponent
  ],
  imports: [
    CommonModule,
    MatNativeDateModule,
    MatRippleModule,
    ReactiveFormsModule,
    MatSliderModule,
    MatIconModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatDividerModule,
    // BrowserAnimationsModule,
    MatSelectModule,
    MatSnackBarModule,
    
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    MyFlightsComponent
  ]
})
export class MyFlightsModule { }
