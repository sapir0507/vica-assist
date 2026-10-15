import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { agentRating, ConfigService, Destination, finalOrder, Order, OrderStatus } from '@vica-assist/shared';

import { orderStage, ORDER_STAGES, stateOf } from 'src/app/modules/all_modules/my-request/timeline';
import { AgentStore } from 'src/app/services/agent/agent.store';
import { BookingStore } from 'src/app/services/booking/booking.store';
import { DestinationStore } from 'src/app/services/destination/destination.store';
import { FinalOrderStore } from 'src/app/services/finalOrder/finalOrder.store';
import { OrderStore } from 'src/app/services/order/order.store';
import { PublicSummaryStore } from 'src/app/services/public-summary/public-summary.store';
import { SessionStore } from 'src/app/services/session/session.store';
import { DestinationCardComponent } from '../../destinations/destination-card/destination-card.component';
import { DestinationArtComponent } from '../../destinations/destination-art/destination-art.component';
import { trendingDestinations } from '../../destinations/destinations';
import { RevealDirective } from '../../effects/reveal.directive';

const MAX_ORDERS = 3;
const CHOICE_LABELS: Record<string, string> = { both: 'Flight + Hotel', flight: 'Flight', hotel: 'Hotel' };

interface OrderRow {
  order: Order;
  booking?: finalOrder;
  stage: number;
  stageLabel: string;
  ready: boolean;
}

@Component({
  standalone: true,
  selector: 'user-homepage',
  templateUrl: './user-homepage.component.html',
  styleUrls: ['./user-homepage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, MatIconModule, DestinationArtComponent, DestinationCardComponent, RevealDirective]
})
export class UserHomepageComponent {
  private router = inject(Router);
  private orderStore = inject(OrderStore);
  private bookingStore = inject(BookingStore);
  private agentStore = inject(AgentStore);
  private finalOrderStore = inject(FinalOrderStore);
  private summaryStore = inject(PublicSummaryStore);
  private destinationStore = inject(DestinationStore);
  private session = inject(SessionStore);
  private config = inject(ConfigService);

  readonly choiceLabels = CHOICE_LABELS;
  readonly destinations = computed(() => trendingDestinations(this.summaryStore.summary(), this.destinationStore.destinations()));
  readonly responseHours = computed(() => this.config.config().assignment.responseHours);

  private readonly mine = computed(() => {
    const username = this.session.username();
    return (this.orderStore.orders() ?? []).filter(order => order.customer === username && order.status !== OrderStatus.Cancelled);
  });

  readonly pendingCount = computed(() => this.mine().filter(order => order.status !== OrderStatus.Finished).length);
  readonly readyCount = computed(() => this.mine().filter(order => order.status === OrderStatus.Finished).length);

  /** Open requests plus booked trips, newest first. A booking only counts when no open request has its number. */
  readonly rows = computed<OrderRow[]>(() => {
    const open = this.mine();
    const openIds = new Set(open.map(order => order.id));
    const booked = this.bookingStore.mine().filter(booking => booking.order && !openIds.has(booking.order.id));
    const entries = [
      ...open.map(order => ({ order, booking: undefined as finalOrder | undefined })),
      ...booked.map(booking => ({ order: booking.order as Order, booking }))
    ];
    return entries
      .sort((a, b) => (b.order.createdAt ?? '').localeCompare(a.order.createdAt ?? '') || b.order.id - a.order.id)
      .slice(0, MAX_ORDERS)
      .map(({ order, booking }) => {
        const stage = orderStage(order, booking);
        return {
          order,
          booking,
          stage,
          stageLabel: ORDER_STAGES[stage - 1],
          ready: stateOf(order, booking) === 'answered'
        };
      });
  });

  private readonly latestOrder = computed(() => this.mine().slice().sort((a, b) => b.id - a.id)[0]);
  readonly firstName = computed(() => this.latestOrder()?.passDetails[0]?.fullName.split(' ')[0] || this.session.username());

  /** The agent of the newest request that has one. */
  readonly agentOrder = computed(() => this.mine().filter(order => order.agent).sort((a, b) => b.id - a.id)[0]);
  readonly agent = computed(() => this.agentStore.byUsername(this.agentOrder()?.agent ?? ''));
  readonly agentFirstName = computed(() => this.agent()?.displayName.split(' ')[0]);
  readonly agentInitials = computed(() => (this.agent()?.displayName ?? '').split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase());
  readonly rating = computed(() => agentRating(this.bookingStore.bookings() ?? [], this.agentOrder()?.agent ?? ''));

  constructor() {
    this.bookingStore.load();
    this.agentStore.load();
    this.summaryStore.load();
  }

  confirm(order: Order): void {
    this.finalOrderStore.update({ order });
    this.router.navigate(['final-order', order.id]);
  }

  book(destination: Destination): void {
    this.router.navigate(['/homepage/book'], { queryParams: { destination: destination.id } });
  }
}
