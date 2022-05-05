import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatFormfieldRoutingModule } from './mat-formfield-routing.module';
import { MatFormfieldComponent } from './mat-formfield.component';
import { MatLabel } from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    MatFormfieldComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatLabel,
    MatInputModule,
    MatFormFieldModule,
    MatFormfieldRoutingModule
  ],
  exports:[
    MatFormfieldComponent
  ]
})
export class MatFormfieldModule { }
