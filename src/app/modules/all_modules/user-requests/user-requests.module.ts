import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DestinationCardComponent } from '../../shared/destinations/destination-card/destination-card.component';
import { UserRequestsComponent } from './user-requests/user-requests.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
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
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatInputModule,
    MatRadioModule,
    MatSnackBarModule,
    MatFormFieldModule,

    DestinationCardComponent,
    ReactiveFormsModule,
    CommonModule
  ],
  exports: [
    UserRequestsComponent
  ],
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', subscriptSizing: 'dynamic' } }]
})
export class UserRequestsModule { }
