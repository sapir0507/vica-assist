import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRequestPreviewComponent } from './user-request-preview/user-request-preview.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import { MyPipesModule } from 'projects/my-pipes/src';


@NgModule({
  declarations: [
    UserRequestPreviewComponent
  ],
  imports: [
    CommonModule,

    MyPipesModule,
    
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
    MatButtonToggleModule
  ],
  exports:[
    UserRequestPreviewComponent
  ]
})
export class UserRequestsPreviewModule { }
