import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, inject, Output, ChangeDetectorRef } from '@angular/core';
import { FinalOrderStore } from 'src/app/services/finalOrder/finalOrder.store';
import { OrderStore } from 'src/app/services/order/order.store';
import { Order } from 'src/interfaces/order.interface';

@Component({
  standalone: false,
  selector: 'pending-order-list',
  templateUrl: './pending-order-list.component.html',
  styleUrls: ['./pending-order-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingOrderListComponent implements OnInit {
  private currentOrders: Order[] | null = null;
  step: number = 1;
  @Output() item: EventEmitter<Order> = new EventEmitter();
  private finalOrderStore = inject(FinalOrderStore);
  protected orderStore = inject(OrderStore);

  ngOnInit(): void {
  }

  nextStep(){
    this.step++;
  }

  previousStep(){
    this.step--;
  }

  selectedItem(item: Order){
    this.finalOrderStore.update({ order: item })
    this.item.emit(item);
  }

}
