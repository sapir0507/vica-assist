import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';

import { BookingStore } from 'src/app/services/booking/booking.store';
import { BookedCardComponent } from '../booked-card/booked-card.component';

@Component({
  standalone: true,
  selector: 'booked-list',
  templateUrl: './booked-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BookedCardComponent]
})
export class BookedListComponent implements OnInit {
  protected store = inject(BookingStore);

  readonly bookings = computed(() =>
    [...this.store.mine()].sort((a, b) => (b.order?.departureDate ?? '').localeCompare(a.order?.departureDate ?? ''))
  );

  ngOnInit(): void {
    this.store.load();
  }
}
