import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input, effect, inject } from '@angular/core';
import { OrderStore } from 'src/app/services/order/order.store';
import { Order } from 'src/interfaces/order.interface';

@Component({
  standalone: false,
  selector: 'ordersList',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersListComponent implements OnInit {

  @Output() chosen: EventEmitter<number> = new EventEmitter();
  @Output() orderID: EventEmitter<string> = new EventEmitter();
  @Output() item: EventEmitter<Order> = new EventEmitter();
  @Output() maxIDs: EventEmitter<number> = new EventEmitter();

  @Input() requestID: number = 1;
  @Input() status?: string = 'agent';

  protected orderStore = inject(OrderStore);

  constructor() {
    effect(() => this.maxIDs.emit(this.orderStore.orders()?.length));
  }

  ngOnInit(): void {
  }

  toggleButton(item: Order){
    // status === 'finished' && customer => show Button
    // status === 'pending' && agent => show button
    if((item.status === 'finished' && !this.isAgent()) || (item.status === 'pending' && this.isAgent())) return true;
    else return false;
  }

  isAgent(){
    if(this.status ==='agent') return true;
    return false;
  }

  openOrder(item: Order){
    this.item.emit(item)
  }

}
