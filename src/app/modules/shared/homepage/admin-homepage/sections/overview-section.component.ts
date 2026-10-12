import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { compareAgents, ConfigService, finalOrder } from '@vica-assist/shared';

import { AdminService } from 'src/app/services/admin/admin.service';
import { AgentStore } from 'src/app/services/agent/agent.store';
import { BookingStore } from 'src/app/services/booking/booking.store';
import { OrderStore } from 'src/app/services/order/order.store';
import { PublicSummaryStore } from 'src/app/services/public-summary/public-summary.store';
import { CountUpDirective } from '../../../effects/count-up.directive';
import { StarRatingComponent } from '../../../rating/star-rating.component';
import { computeInsights } from '../../agent-homepage/insights/insights';
import { InsightsComponent } from '../../agent-homepage/insights/insights.component';

@Component({
  standalone: true,
  selector: 'admin-overview',
  templateUrl: './overview-section.component.html',
  styleUrls: ['./sections.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CountUpDirective, InsightsComponent, StarRatingComponent]
})
export class OverviewSectionComponent {
  private orders = inject(OrderStore);
  private agents = inject(AgentStore);
  private bookings = inject(BookingStore);
  private config = inject(ConfigService);
  private admin = inject(AdminService);
  private publicSummary = inject(PublicSummaryStore);

  readonly error = signal<string | null>(null);

  readonly kpis = computed(() => {
    const insights = computeInsights(this.orders.orders() ?? [], this.bookings.bookings() ?? []);
    const { hotel, flight } = insights.satisfaction;
    const ratings = hotel.count + flight.count;
    const pleased = ratings
      ? Math.round(((hotel.satisfiedPercent ?? 0) * hotel.count + (flight.satisfiedPercent ?? 0) * flight.count) / ratings)
      : null;
    return { received: insights.funnel.received, booked: insights.funnel.booked, pleased, hours: insights.business.averageResponseHours };
  });

  readonly rows = computed(() =>
    compareAgents(this.orders.orders() ?? [], this.bookings.bookings() ?? [], this.agents.agents() ?? [], new Date(), this.config.config().assignment)
  );

  readonly reviews = computed(() => (this.bookings.bookings() ?? []).filter(booking => (booking.feedback?.review ?? '').trim() !== ''));

  constructor() {
    this.agents.load();
    this.bookings.load();
    this.publicSummary.refresh();
  }

  rounded(rating: number): number {
    return Math.round(rating);
  }

  toggleReview(booking: finalOrder): void {
    this.error.set(null);
    this.admin.setReviewHidden(booking, !booking.feedback?.hidden).subscribe({ error: (error: Error) => this.error.set(error.message) });
  }
}
