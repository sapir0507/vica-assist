import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyFlightsComponent } from './my-flights.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule, MatDateSelectionModel, MatSingleDateSelectionModel, MatRangeDateSelectionModel } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';



@NgModule({
  declarations: [
    MyFlightsComponent
  ],
  imports: [
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
    BrowserAnimationsModule,
    MatSelectModule,
    //  MatDateSelectionModel,
    // MatRangeDateSelectionModel,
    // MatSingleDateSelectionModel,
    FormsModule
  ],
  exports: [
    MyFlightsComponent
  ]
})
export class MyFlightsModule { }
