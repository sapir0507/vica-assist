import { NgModule } from '@angular/core';
import { MatInputComponent } from './mat-input.component';
import { SelectComponent } from './select/select.component';



@NgModule({
  declarations: [
    MatInputComponent,
    SelectComponent
  ],
  imports: [
  ],
  exports: [
    MatInputComponent
  ]
})
export class MatInputModule { }
