import { NgModule } from '@angular/core';
import { ItemComponent } from './item.component';

import { MatCardModule } from '@angular/material/card'
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { NgbCarouselModule, NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';

import { FlightItemComponent } from './flight-item/flight-item.component';
import { HotelItemComponent } from './hotel-item/hotel-item.component';
import { MyPipesModule } from 'projects/my-pipes/src';
import { MatButtonModule } from '@angular/material/button';
import { MatLineModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';





@NgModule({
  declarations: [
    ItemComponent,
    FlightItemComponent,
    HotelItemComponent,
  ],
  imports: [
    CommonModule,

    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatLineModule,
    MatTooltipModule,
    MatExpansionModule,
    MatListModule,

    NgbRatingModule,
    NgbCarouselModule,

    MyPipesModule
  ],
  exports: [
    ItemComponent
  ]
})
export class ItemModule { }
