import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRequestsComponent } from './user-requests/user-requests.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';





@NgModule({
  declarations: [
    UserRequestsComponent
  ],
  imports: [
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,    MatSelectModule,
    MatInputModule,
    MatRadioModule,
    MatSnackBarModule,
    MatFormFieldModule,

    ReactiveFormsModule,
    CommonModule
  ],
  exports: [
    UserRequestsComponent
  ],
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', subscriptSizing: 'dynamic' } }]
})
export class UserRequestsModule { }
