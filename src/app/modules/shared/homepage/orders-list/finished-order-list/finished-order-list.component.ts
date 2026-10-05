import { Component, OnInit, ChangeDetectionStrategy, inject, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FinalOrderStore } from 'src/app/services/finalOrder/finalOrder.store';
import { OrderStore } from 'src/app/services/order/order.store';
import { Order } from 'src/interfaces/order.interface';

@Component({
  standalone: false,
  selector: 'finished-order-list',
  templateUrl: './finished-order-list.component.html',
  styleUrls: ['./finished-order-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinishedOrderListComponent implements OnInit {
  private currentOrders: Order[] | null = null;
  @Output() item: EventEmitter<Order> = new EventEmitter();
  protected orderStore = inject(OrderStore);

  step: number = 1;
  private finalOrderStore = inject(FinalOrderStore);

  constructor(
    private changeDetectionRef: ChangeDetectorRef
    ) { }

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
    this.item.emit(item)
  }

}
