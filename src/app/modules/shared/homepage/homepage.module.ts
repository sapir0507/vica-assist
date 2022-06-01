import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyFlightsModule } from 'projects/my-flights/src';
import { MyHotelsModule } from 'projects/my-hotels/src';
import { MyPipesModule } from 'projects/my-pipes/src';

import { UserRequestsModule } from '../../all_modules/user-requests/user-requests.module';
import { UserRequestsPreviewModule } from '../../all_modules/user-requests-preview/user-requests-preview.module';

import { MatButtonModule } from '@angular/material/button';
import { OrdersListComponent } from './orders-list/orders-list.component';
import { MatCardModule } from '@angular/material/card';

import { HomepageRoutingModule } from './homepage-routing.module';
import { HomepageComponent } from './homepage.component';
import { AgentHomepageComponent } from './agent-homepage/agent-homepage.component';
import { UserHomepageComponent } from './user-homepage/user-homepage.component';
import { GenericHomepageComponent } from './generic-homepage/generic-homepage.component';
import { PendingOrderListComponent } from './orders-list/pending-order-list/pending-order-list.component';
import { FinishedOrderListComponent } from './orders-list/finished-order-list/finished-order-list.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from 'projects/mat-input/src/public-api';
import { MatLineModule } from '@angular/material/core';
import { OrderListItemComponent } from './orders-list/order-list-item/order-list-item.component';




@NgModule({
  declarations: [
    HomepageComponent,
    OrdersListComponent,
    AgentHomepageComponent,
    UserHomepageComponent,
    GenericHomepageComponent,
    PendingOrderListComponent,
    FinishedOrderListComponent,
    OrderListItemComponent
  ],
  imports: [
    CommonModule,

    MyFlightsModule,
    MyHotelsModule,
    MyPipesModule,

    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatInputModule,
    MatButtonModule,
    MatLineModule,

    UserRequestsModule,
    UserRequestsPreviewModule,
    HomepageRoutingModule
  ],
  exports:[
    HomepageComponent
  ]
})
export class HomepageModule { }
