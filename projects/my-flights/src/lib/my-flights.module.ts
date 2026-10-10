import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyFlightsComponent } from './my-flights.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule} from '@angular/material/snack-bar';
import { MatDividerModule} from '@angular/material/divider';


@NgModule({
  declarations: [
    MyFlightsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    FormsModule,    MatIconModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatSelectModule,
    MatSnackBarModule,
    
  ],
  exports: [
    MyFlightsComponent
  ],
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', subscriptSizing: 'dynamic' } }]
})
export class MyFlightsModule { }
