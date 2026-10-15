import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { finalOrder, Order, OrderStatus } from '@vica-assist/shared';

import { AgentStore } from 'src/app/services/agent/agent.store';
import { BookingStore } from 'src/app/services/booking/booking.store';
import { OrderStore } from 'src/app/services/order/order.store';
import { SessionStore } from 'src/app/services/session/session.store';
import { MessageThreadComponent } from '../../message-thread/message-thread.component';

/** Messages are kept per request, so the customer picks which request to talk to the agent about. */
@Component({
  standalone: true,
  selector: 'messages-page',
  templateUrl: './messages-page.component.html',
  styleUrls: ['./messages-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule, MessageThreadComponent]
})
export class MessagesPageComponent {
  private orderStore = inject(OrderStore);
  private bookingStore = inject(BookingStore);
  private agentStore = inject(AgentStore);
  private route = inject(ActivatedRoute);
  readonly username = inject(SessionStore).username;

  /** Narrows the list to one agent when the page is opened from that agent's card. */
  private readonly agentFilter = this.route.snapshot.queryParamMap.get('agent');
  readonly selectedId = signal<number | null>(null);

  /** Requests that have an agent: open ones, then booked trips whose number no open request uses. */
  readonly orders = computed<Order[]>(() => {
    const username = this.username();
    const open = (this.orderStore.orders() ?? []).filter(order => order.customer === username && order.status !== OrderStatus.Cancelled);
    const openIds = new Set(open.map(order => order.id));
    const booked = this.bookingStore.mine()
      .filter((booking): booking is finalOrder & { order: Order } => !!booking.order && !openIds.has(booking.order.id))
      .map(booking => booking.order);
    return [...open, ...booked]
      .filter(order => order.agent && (!this.agentFilter || order.agent === this.agentFilter))
      .sort((a, b) => b.id - a.id);
  });

  readonly selected = computed(() => this.orders().find(order => order.id === this.selectedId()));

  constructor() {
    this.bookingStore.load();
    this.agentStore.load();
  }

  agentName(order: Order): string {
    return this.agentStore.byUsername(order.agent ?? '')?.displayName ?? order.agent ?? '';
  }

  select(order: Order): void {
    this.selectedId.set(order.id);
  }
}
