import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRequestPreviewComponent } from './user-request-preview/user-request-preview.component';
import { MatIconModule } from '@angular/material/icon';
import { MyPipesModule } from '@vica-assist/my-pipes';


@NgModule({
  declarations: [
    UserRequestPreviewComponent
  ],
  imports: [
    CommonModule,

    MyPipesModule,
    
    MatIconModule,
  ],
  exports:[
    UserRequestPreviewComponent
  ]
})
export class UserRequestsPreviewModule { }
