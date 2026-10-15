import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { finalOrder, hasTripEnded } from '@vica-assist/shared';

import { BookingStore } from 'src/app/services/booking/booking.store';
import { BookedCardComponent } from '../booked-card/booked-card.component';

@Component({
  standalone: true,
  selector: 'booked-list',
  templateUrl: './booked-list.component.html',
  styleUrl: './booked-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink, MatButtonModule, MatIconModule, BookedCardComponent]
})
export class BookedListComponent implements OnInit {
  protected store = inject(BookingStore);

  readonly bookings = computed(() => this.store.mine());

  /** Trips still ahead, the soonest first. */
  readonly upcoming = computed(() =>
    this.bookings().filter(booking => !hasTripEnded(booking.order?.returnDate)).sort((a, b) => this.departure(a).localeCompare(this.departure(b)))
  );

  /** Trips that are over, the latest first. */
  readonly past = computed(() =>
    this.bookings().filter(booking => hasTripEnded(booking.order?.returnDate)).sort((a, b) => this.departure(b).localeCompare(this.departure(a)))
  );

  readonly pastTotal = computed(() => this.past().reduce((sum, booking) => sum + (booking.hotel?.price ?? 0) + (booking.flight?.price ?? 0), 0));

  private departure(booking: finalOrder): string {
    return booking.order?.departureDate ?? '';
  }

  ngOnInit(): void {
    this.store.load();
  }
}
