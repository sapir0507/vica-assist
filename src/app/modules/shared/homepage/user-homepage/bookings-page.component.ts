import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Order, OrderStatus } from '@vica-assist/shared';

import { BookingStore } from 'src/app/services/booking/booking.store';
import { OrderStore } from 'src/app/services/order/order.store';
import { SessionStore } from 'src/app/services/session/session.store';
import { BookedListComponent } from '../../bookings/booked-list/booked-list.component';
import { OrderStatusListComponent } from '../orders-list/order-status-list/order-status-list.component';

type Tab = 'pending' | 'ready' | 'booked';

@Component({
  standalone: true,
  selector: 'bookings-page',
  templateUrl: './bookings-page.component.html',
  styleUrls: ['./bookings-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule, OrderStatusListComponent, BookedListComponent]
})
export class BookingsPageComponent {
  private router = inject(Router);
  private orderStore = inject(OrderStore);
  private bookingStore = inject(BookingStore);
  private username = inject(SessionStore).username;

  readonly tab = signal<Tab>('ready');

  private readonly mine = computed(() =>
    (this.orderStore.orders() ?? []).filter(order => order.customer === this.username() && order.status !== OrderStatus.Cancelled)
  );

  readonly tabs = computed<{ id: Tab; label: string; count: number }[]>(() => [
    { id: 'pending', label: 'Waiting for agent', count: this.mine().filter(order => order.status !== OrderStatus.Finished).length },
    { id: 'ready', label: 'Ready to choose', count: this.mine().filter(order => order.status === OrderStatus.Finished).length },
    { id: 'booked', label: 'Booked', count: this.bookingStore.mine().length }
  ]);

  constructor() {
    this.bookingStore.load();
  }

  selectedItem(item: Order): void {
    this.router.navigate(['final-order', item.id]);
  }
}
