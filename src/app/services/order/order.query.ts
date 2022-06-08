import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { OrderService } from './order.service';
import { OrderStore, OrderState } from './order.store';

@Injectable({ providedIn: 'root' })
export class OrderQuery extends QueryEntity<OrderState> {

  allOrders$ = this.select()
  getorders$ = this.select('orders')
  getisLoading$ = this.select('isLoading')
  getPenddingOrders$ = this.select('pendingOrders')
  getFinishedOrders$ = this.select('finishedOrders')
 
  constructor(
    protected override store: OrderStore,
    protected service: OrderService
    ) {
     super(store);
    }

  
}
