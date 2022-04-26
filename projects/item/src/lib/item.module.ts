import { NgModule } from '@angular/core';
import { ItemComponent } from './item.component';
import { MatCardModule } from '@angular/material/card'




@NgModule({
  declarations: [
    ItemComponent,
  ],
  imports: [
    MatCardModule
  ],
  exports: [
    ItemComponent
  ]
})
export class ItemModule { }
