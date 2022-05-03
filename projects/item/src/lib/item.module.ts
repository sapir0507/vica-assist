import { NgModule } from '@angular/core';
import { ItemComponent } from './item.component';
import { MatCardModule } from '@angular/material/card'
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';




@NgModule({
  declarations: [
    ItemComponent,
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  exports: [
    ItemComponent
  ]
})
export class ItemModule { }
