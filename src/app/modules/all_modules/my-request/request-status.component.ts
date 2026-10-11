import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { agentRating, ConfigService, describePreferences, finalOrder, hasTripEnded, Order } from '@vica-assist/shared';
import { MyPipesModule } from '@vica-assist/my-pipes';

import { AgentStore } from 'src/app/services/agent/agent.store';
import { BookingStore } from 'src/app/services/booking/booking.store';
import { FinalOrderStore } from 'src/app/services/finalOrder/finalOrder.store';
import { OrderStore } from 'src/app/services/order/order.store';
import { SessionStore } from 'src/app/services/session/session.store';
import { OfferSummaryComponent } from '../../shared/homepage/orders-list/offer-summary/offer-summary.component';
import { MessageThreadComponent } from '../../shared/message-thread/message-thread.component';
import { StarRatingComponent } from '../../shared/rating/star-rating.component';
import { buildTimeline, RequestState, stateOf } from './timeline';

const STATE_LABELS: Record<RequestState, string> = {
  pending: 'Waiting for your agent',
  answered: 'Ready for you to choose',
  booked: 'Booked',
  cancelled: 'Cancelled'
};

@Component({
  standalone: true,
  selector: 'request-status',
  templateUrl: './request-status.component.html',
  styleUrls: ['./request-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, RouterLink, MatButtonModule, MatIconModule, MyPipesModule, OfferSummaryComponent, MessageThreadComponent, StarRatingComponent]
})
export class RequestStatusComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderStore = inject(OrderStore);
  private bookingStore = inject(BookingStore);
  private agentStore = inject(AgentStore);
  private finalOrderStore = inject(FinalOrderStore);
  private sessionStore = inject(SessionStore);
  private configService = inject(ConfigService);

  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly confirmingCancel = signal(false);
  readonly error = signal<string | null>(null);
  private checkedOverdue = false;

  readonly username = computed(() => this.sessionStore.username());
  readonly loaded = computed(() => this.orderStore.orders() !== undefined && this.bookingStore.bookings() !== undefined);

  /** Only the customer's own request is ever shown, so another customer's id looks the same as a missing one. */
  private readonly live = computed<Order | undefined>(() =>
    this.orderStore.orders()?.find(order => order.id === this.id && order.customer === this.username())
  );
  /** A booking only counts when no open request has the number: older bookings may carry a number that was reused. */
  readonly booking = computed<finalOrder | undefined>(() =>
    this.live() ? undefined : this.bookingStore.mine().find(booking => booking.order?.id === this.id)
  );
  readonly order = computed<Order | undefined>(() => this.live() ?? this.booking()?.order);
  readonly state = computed(() => stateOf(this.order(), this.booking()));
  readonly statusLabel = computed(() => (this.state() ? STATE_LABELS[this.state() as RequestState] : ''));
  readonly timeline = computed(() => {
    const order = this.order();
    const state = this.state();
    return order && state ? buildTimeline(order, state, this.booking()?.bookedAt) : [];
  });

  readonly agent = computed(() => this.agentStore.byUsername(this.order()?.agent ?? ''));
  readonly rating = computed(() => agentRating(this.bookingStore.bookings() ?? [], this.order()?.agent ?? ''));
  readonly responseHours = computed(() => this.configService.config().assignment.responseHours);
  readonly wishes = computed(() => describePreferences(this.order()?.preferences, this.configService.config()));
  readonly tripEnded = computed(() => hasTripEnded(this.order()?.returnDate));
  readonly canRate = computed(() => this.state() === 'booked' && this.tripEnded() && !this.booking()?.feedback);

  readonly reassignment = computed(() => {
    const history = this.order()?.assignments ?? [];
    const last = history[history.length - 1];
    if (!last || last.reason === 'initial') return null;
    const name = this.agentStore.byUsername(last.agent)?.displayName ?? last.agent;
    const hours = this.responseHours();
    if (last.reason === 'overdue') return `Your request was moved to ${name} because it was not answered within ${hours} hours.`;
    if (last.reason === 'agent-unavailable') return `Your request was moved to ${name} because your first agent became unavailable.`;
    return `Your request was passed to ${name}.`;
  });

  readonly nextStep = computed(() => {
    const name = this.agent()?.displayName ?? 'An agent';
    switch (this.state()) {
      case 'pending':
        return this.order()?.agent
          ? `${name} is reading your request and will add hotel and flight options, usually within ${this.responseHours()} hours. You will see them here.`
          : `An agent will be assigned to your request shortly, and will answer usually within ${this.responseHours()} hours.`;
      case 'answered':
        return `${name} has added options for you. Compare them and choose the hotel and flight you like.`;
      case 'booked':
        return this.tripEnded()
          ? 'We hope you had a good trip. Rate your hotel and flight to help other travelers.'
          : `Your choices are with ${name}, who completes the booking. You can rate the trip after you return.`;
      case 'cancelled':
        return 'This request was cancelled. Nothing was booked.';
      default:
        return '';
    }
  });

  constructor() {
    this.agentStore.load();
    this.bookingStore.load();
    effect(() => {
      if (this.checkedOverdue || !this.agentStore.agents() || !this.orderStore.orders()) return;
      this.checkedOverdue = true;
      this.orderStore.runReassignments(this.agentStore.agents() ?? [], this.configService.config().assignment);
    });
  }

  rounded(rating: number): number {
    return Math.round(rating);
  }

  initials(name: string): string {
    return name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase();
  }

  refresh(): void {
    this.error.set(null);
    this.orderStore.getAll().subscribe();
    this.bookingStore.load();
    this.agentStore.load();
  }

  choose(): void {
    const order = this.order();
    if (!order) return;
    this.finalOrderStore.update({ order });
    this.router.navigate(['/final-order', order.id]);
  }

  askToCancel(): void {
    this.confirmingCancel.set(true);
  }

  keep(): void {
    this.confirmingCancel.set(false);
  }

  cancel(): void {
    this.orderStore.cancel(this.id).subscribe({
      next: () => this.confirmingCancel.set(false),
      error: (error: Error) => {
        this.error.set(error.message);
        this.confirmingCancel.set(false);
      }
    });
  }
}
