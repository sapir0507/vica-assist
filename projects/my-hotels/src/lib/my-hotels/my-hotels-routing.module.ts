import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyHotelsComponent } from './my-hotels.component';

const routes: Routes = [{
  path: '',
  component: MyHotelsComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyHotelsRoutingModule { }
