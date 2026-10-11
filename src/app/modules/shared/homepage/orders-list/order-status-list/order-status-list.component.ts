import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FinalOrderStore } from 'src/app/services/finalOrder/finalOrder.store';
import { OrderStore } from 'src/app/services/order/order.store';
import { SessionStore } from 'src/app/services/session/session.store';
import { Order } from '@vica-assist/shared';
import { OrderListItemComponent } from '../order-list-item/order-list-item.component';

@Component({
  standalone: true,
  selector: 'order-status-list',
  templateUrl: './order-status-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrderListItemComponent]
})
export class OrderStatusListComponent {
  @Input({ required: true }) status!: 'pending' | 'finished';
  @Output() item: EventEmitter<Order> = new EventEmitter();
  protected orderStore = inject(OrderStore);
  private finalOrderStore = inject(FinalOrderStore);
  private sessionStore = inject(SessionStore);

  orders(): Order[] | undefined {
    const orders = this.status === 'pending' ? this.orderStore.pendingOrders() : this.orderStore.finishedOrders();
    return orders?.filter(order => order.customer === this.sessionStore.username());
  }

  selectedItem(item: Order) {
    this.finalOrderStore.update({ order: item });
    this.item.emit(item);
  }
}
