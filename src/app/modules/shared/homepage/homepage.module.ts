import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomepageRoutingModule } from './homepage-routing.module';
import { HomepageComponent } from './homepage.component';
import { UserRequestsModule } from '../../all_modules/user-requests/user-requests.module';
import { UserRequestsPreviewModule } from '../../all_modules/user-requests-preview/user-requests-preview.module';
import { MyFlightsModule } from 'projects/my-flights/src';
import { MyHotelsModule } from 'projects/my-hotels/src';
import { MatButtonModule } from '@angular/material/button';
import { OrdersListComponent } from './orders-list/orders-list.component';
import { MatCardModule } from '@angular/material/card';




@NgModule({
  declarations: [
    HomepageComponent,
    OrdersListComponent
  ],
  imports: [
    CommonModule,

    MyFlightsModule,
    MyHotelsModule,

    MatButtonModule,
    MatCardModule,

    UserRequestsModule,
    UserRequestsPreviewModule,
    HomepageRoutingModule
  ],
  exports:[
    HomepageComponent
  ]
})
export class HomepageModule { }
