import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MyHotelsComponent } from './my-hotels.component';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { HotelsService } from './hotels.service';
import { FileUploadComponent } from './file-upload/file-upload.component';

@NgModule({
  declarations: [
    MyHotelsComponent,
    FileUploadComponent
  ],
  imports: [
    CommonModule,    MatIconModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    
    FormsModule,
    ReactiveFormsModule
  ],
  exports:[
    MyHotelsComponent
  ],
  providers:[
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', subscriptSizing: 'dynamic' } },
    HotelsService
  ]
})
export class MyHotelsModule { }
