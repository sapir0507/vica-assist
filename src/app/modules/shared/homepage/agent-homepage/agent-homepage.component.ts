import { Component, ChangeDetectionStrategy, effect, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MyFlightsModule } from '@vica-assist/my-flights';
import { MyHotelsModule } from '@vica-assist/my-hotels';
import { UserRequestsPreviewModule } from 'src/app/modules/all_modules/user-requests-preview/user-requests-preview.module';
import { OrderStore } from 'src/app/services/order/order.store';
import { Agent, ConfigService, isVisibleToAgent, Order, OrderStatus } from '@vica-assist/shared';
import { AgentStore } from 'src/app/services/agent/agent.store';
import { SessionStore } from 'src/app/services/session/session.store';
import { OrdersListComponent } from '../orders-list/orders-list.component';
import { MessageThreadComponent } from '../../message-thread/message-thread.component';
import { InsightsComponent } from './insights/insights.component';

type AgentView = 'requests' | 'insights';
type OfferStep = 'flight' | 'hotel';

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
    InsightsComponent,
    MessageThreadComponent
  ]
})
export class AgentHomepageComponent {
  view: AgentView = 'requests';
  step: OfferStep = 'flight';
  chosenID = 1;
  orderID: string | null = null;
  private position = 0;
  private orderStore = inject(OrderStore);
  private agentStore = inject(AgentStore);
  private sessionStore = inject(SessionStore);
  private configService = inject(ConfigService);
  private checkedOverdue = false;

  constructor() {
    this.agentStore.load();
    effect(() => {
      if (this.checkedOverdue || !this.agentStore.agents() || !this.orderStore.orders()) return;
      this.checkedOverdue = true;
      this.moveRequests();
    });
  }

  get username(): string {
    return this.sessionStore.username();
  }

  get profile(): Agent | undefined {
    return this.agentStore.byUsername(this.username);
  }

  get pending(): Order[] {
    return (this.orderStore.pendingOrders() ?? []).filter(order => isVisibleToAgent(order, this.username));
  }

  setAvailability(available: boolean){
    this.agentStore.setAvailability(this.username, available).subscribe(() => {
      if (!available) this.moveRequests();
    });
  }

  /** Hands over requests that are overdue or belong to an agent who is away. */
  private moveRequests(){
    this.orderStore.runReassignments(this.agentStore.agents() ?? [], this.configService.config().assignment);
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

  showView(view: AgentView){
    this.view = view;
  }

  showStep(step: OfferStep){
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
    this.orderStore.updateStatusByOrderID(this.orderID, OrderStatus.Finished);
    this.orderID = null;
  }

  private moveTo(position: number){
    this.position = Math.min(Math.max(position, 0), Math.max(this.pending.length - 1, 0));
    this.orderID = null;
  }
}
