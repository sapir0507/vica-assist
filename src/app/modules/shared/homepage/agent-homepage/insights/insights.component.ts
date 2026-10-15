import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input } from '@angular/core';

import { isVisibleToAgent } from '@vica-assist/shared';
import { BookingStore } from 'src/app/services/booking/booking.store';
import { OrderStore } from 'src/app/services/order/order.store';
import { BarListComponent } from '../../../charts/bar-list.component';
import { CountUpDirective } from '../../../effects/count-up.directive';
import { StarRatingComponent } from '../../../rating/star-rating.component';
import { computeInsights, PartSatisfaction } from './insights';

@Component({
  standalone: true,
  selector: 'agent-insights',
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BarListComponent, CountUpDirective, StarRatingComponent]
})
export class InsightsComponent implements OnInit {
  protected bookingStore = inject(BookingStore);
  private orderStore = inject(OrderStore);

  /** Username of the agent whose numbers to show; leave empty for the whole company. */
  agent = input<string | null>(null);

  readonly insights = computed(() => {
    const agent = this.agent();
    const orders = this.orderStore.orders() ?? [];
    const bookings = this.bookingStore.bookings() ?? [];
    return agent === null
      ? computeInsights(orders, bookings)
      : computeInsights(orders.filter(order => isVisibleToAgent(order, agent)), bookings.filter(booking => isVisibleToAgent(booking.order, agent)));
  });

  readonly parts = computed(() => [
    { title: 'Hotels', label: 'Average hotel rating', data: this.insights().satisfaction.hotel },
    { title: 'Flights', label: 'Average flight rating', data: this.insights().satisfaction.flight }
  ]);

  readonly months = computed(() =>
    this.insights().business.bookingsPerMonth.map(({ label, count }) => ({
      label: new Date(`${label}-01T00:00:00`).toLocaleDateString('en', { month: 'short', year: 'numeric' }),
      count
    }))
  );

  ngOnInit(): void {
    this.bookingStore.load();
  }

  distribution(data: PartSatisfaction) {
    return data.distribution.map((count, index) => ({ label: `${index + 1} ${index === 0 ? 'star' : 'stars'}`, count })).reverse();
  }

  rounded(rating: number): number {
    return Math.round(rating);
  }

  responseTime(hours: number | null): string {
    if (hours === null) return 'Not enough data';
    if (hours < 1) return `${Math.round(hours * 60)} minutes`;
    if (hours < 48) return `${hours} hours`;
    return `${Math.round((hours / 24) * 10) / 10} days`;
  }
}
