import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MyPipesModule } from '@vica-assist/my-pipes';
import { bookedParts, FeedbackInput, finalOrder, hasTripEnded } from '@vica-assist/shared';

import { BookingStore } from 'src/app/services/booking/booking.store';
import { StarRatingComponent } from '../../rating/star-rating.component';
import { FeedbackFormComponent } from '../feedback-form/feedback-form.component';

@Component({
  standalone: true,
  selector: 'booked-card',
  templateUrl: './booked-card.component.html',
  styleUrls: ['./booked-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, MatButtonModule, MyPipesModule, StarRatingComponent, FeedbackFormComponent]
})
export class BookedCardComponent {
  booking = input.required<finalOrder>();

  private store = inject(BookingStore);

  editing = signal(false);
  error = signal<string | null>(null);

  parts = computed(() => bookedParts(this.booking().order?.choice));
  ended = computed(() => hasTripEnded(this.booking().order?.returnDate));
  total = computed(() => (this.booking().hotel?.price ?? 0) + (this.booking().flight?.price ?? 0));

  rate(input: FeedbackInput): void {
    this.error.set(null);
    this.store.rate(this.booking().id, input).subscribe({
      next: () => this.editing.set(false),
      error: (error: Error) => this.error.set(error.message)
    });
  }
}
