import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomepageRoutingModule } from './homepage-routing.module';
import { HomepageComponent } from './homepage.component';
import { ItemModule } from 'projects/item/src/item';
// import { MyFlightsModule } from 'projects/my-flights/src/public-api';
// import { MyHotelsModule } from 'projects/my-hotels/src/lib/my-hotels/my-hotels.module';


@NgModule({
  declarations: [
    HomepageComponent
  ],
  imports: [
    CommonModule,
    ItemModule,
    // MyFlightsModule,
    // MyHotelsModule,
    HomepageRoutingModule
  ],
  exports:[
    HomepageComponent
  ]
})
export class HomepageModule { }
