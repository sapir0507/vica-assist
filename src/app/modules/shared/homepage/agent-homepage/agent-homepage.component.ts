import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MyFlightsModule } from '@vica-assist/my-flights';
import { MyHotelsModule } from '@vica-assist/my-hotels';
import { UserRequestsPreviewModule } from 'src/app/modules/all_modules/user-requests-preview/user-requests-preview.module';
import { OrderStore } from 'src/app/services/order/order.store';
import { Order } from '@vica-assist/shared';
import { OrdersListComponent } from '../orders-list/orders-list.component';
import { InsightsComponent } from './insights/insights.component';

@Component({
  standalone: true,
  selector: 'agent-homepage',
  templateUrl: './agent-homepage.component.html',
  styleUrls: ['./agent-homepage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UserRequestsPreviewModule,
    MyFlightsModule,
    MyHotelsModule,
    OrdersListComponent,
    MatButtonModule,
    MatIconModule,
    InsightsComponent
  ]
})
export class AgentHomepageComponent {
  view: 'requests' | 'insights' = 'requests';
  step: 'flight' | 'hotel' = 'flight';
  chosenID = 1;
  orderID: string | null = null;
  private position = 0;
  private orderStore = inject(OrderStore);

  get pending(): Order[] {
    return this.orderStore.pendingOrders() ?? [];
  }

  get index(): number {
    return Math.min(this.position, Math.max(this.pending.length - 1, 0));
  }

  get current(): Order | undefined {
    return this.pending[this.index];
  }

  get order(): Order | undefined {
    return this.orderStore.orders()?.find(order => order.orderID == this.orderID);
  }

  showView(view: 'requests' | 'insights'){
    this.view = view;
  }

  showStep(step: 'flight' | 'hotel'){
    this.step = step;
  }

  nextRequest(){
    this.moveTo(this.index + 1);
  }

  previousRequest(){
    this.moveTo(this.index - 1);
  }

  onChosen2(item: Order){
    this.chosenID = item.id;
    this.orderID = item.id + ''; //gives all flights and hotels a common id that belongs to an order
  }

  updateState(){
    if(!this.orderID) return;
    this.orderStore.updateStatusByOrderID(this.orderID, 'finished');
    this.orderID = null;
  }

  private moveTo(position: number){
    this.position = Math.min(Math.max(position, 0), Math.max(this.pending.length - 1, 0));
    this.orderID = null;
  }
}
