
        import { NgModule } from '@angular/core';
        import { CommonModule } from '@angular/common';
        import { MyPipesComponent } from './my-pipes/my-pipes.component';
        import { Capitalize } from './my-pipes/my-pipes.pipe';
        
        @NgModule({
          imports: [
            CommonModule
          ],
          declarations: [
            MyPipesComponent,
            Capitalize
          ],
          exports:[
            Capitalize
          ]
        })
        export class MyPipesModule { }
        