import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FinalOrderStore } from 'src/app/services/finalOrder/finalOrder.store';
import { OrderStore } from 'src/app/services/order/order.store';
import { Order } from 'src/interfaces/order.interface';

@Component({
  standalone: false,
  selector: 'order-status-list',
  templateUrl: './order-status-list.component.html',
  styleUrls: ['./order-status-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderStatusListComponent {
  @Input({ required: true }) status!: 'pending' | 'finished';
  @Output() item: EventEmitter<Order> = new EventEmitter();
  protected orderStore = inject(OrderStore);
  private finalOrderStore = inject(FinalOrderStore);

  orders(): Order[] | undefined {
    return this.status === 'pending' ? this.orderStore.pendingOrders() : this.orderStore.finishedOrders();
  }

  selectedItem(item: Order) {
    this.finalOrderStore.update({ order: item });
    this.item.emit(item);
  }
}
