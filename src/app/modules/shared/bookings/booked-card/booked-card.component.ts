import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe, NgTemplateOutlet, UpperCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MyPipesModule } from '@vica-assist/my-pipes';
import { bookedParts, FeedbackInput, finalOrder, hasTripEnded } from '@vica-assist/shared';

import { BookingStore } from 'src/app/services/booking/booking.store';
import { DestinationArtComponent } from '../../destinations/destination-art/destination-art.component';
import { StarRatingComponent } from '../../rating/star-rating.component';
import { FeedbackFormComponent } from '../feedback-form/feedback-form.component';

const DAY_MS = 24 * 60 * 60 * 1000;

/** One booked trip: a ticket while it is ahead of the customer, a row that opens up for details and the review once it is over. */
@Component({
  standalone: true,
  selector: 'booked-card',
  templateUrl: './booked-card.component.html',
  styleUrls: ['./booked-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, DatePipe, DecimalPipe, NgTemplateOutlet, UpperCasePipe, MatButtonModule, MatIconModule, MyPipesModule,
    DestinationArtComponent, StarRatingComponent, FeedbackFormComponent
  ]
})
export class BookedCardComponent {
  booking = input.required<finalOrder>();

  private store = inject(BookingStore);

  editing = signal(false);
  expanded = signal(false);
  error = signal<string | null>(null);

  parts = computed(() => bookedParts(this.booking().order?.choice));
  ended = computed(() => hasTripEnded(this.booking().order?.returnDate));
  total = computed(() => (this.booking().hotel?.price ?? 0) + (this.booking().flight?.price ?? 0));

  /** How much of the budget the trip used, 0 to 100, for the ring and the bar. */
  budgetPercent = computed(() => {
    const budget = this.booking().order?.priceRange ?? 0;
    return budget > 0 ? Math.min(100, Math.round((this.total() / budget) * 100)) : 0;
  });

  /** The average of the ratings given, one decimal; null before the trip was rated. */
  averageRating = computed(() => {
    const feedback = this.booking().feedback;
    const given = [feedback?.hotelRating, feedback?.flightRating].filter((rating): rating is number => !!rating);
    return given.length ? Math.round((given.reduce((sum, rating) => sum + rating, 0) / given.length) * 10) / 10 : null;
  });

  departure = computed(() => {
    const days = Math.ceil((Date.parse(this.booking().order?.departureDate ?? '') - Date.now()) / DAY_MS);
    if (days > 1) return `Leaves in ${days} days`;
    if (days === 1) return 'Leaves tomorrow';
    return 'Your trip is under way';
  });

  rate(input: FeedbackInput): void {
    this.error.set(null);
    this.store.rate(this.booking().id, input).subscribe({
      next: () => this.editing.set(false),
      error: (error: Error) => this.error.set(error.message)
    });
  }
}
