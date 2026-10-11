import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DestinationCardComponent } from '../../shared/destinations/destination-card/destination-card.component';
import { PlaceFieldComponent } from '../../shared/place-field/place-field.component';
import { StarRatingComponent } from '../../shared/rating/star-rating.component';
import { UserRequestsComponent } from './user-requests/user-requests.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
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
    MatInputModule,
    MatRadioModule,
    MatSnackBarModule,
    MatFormFieldModule,

    DestinationCardComponent,
    PlaceFieldComponent,
    StarRatingComponent,
    ReactiveFormsModule,
    CommonModule
  ],
  exports: [
    UserRequestsComponent
  ],
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', subscriptSizing: 'dynamic' } }]
})
export class UserRequestsModule { }
