import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { filter, map } from 'rxjs';
import { OrderService } from './order.service';
import { OrderStore, OrderState } from './order.store';

@Injectable({ providedIn: 'root' })
export class OrderQuery extends QueryEntity<OrderState> {

  allOrders$ = this.select()
  getorders$ = this.select('order')
  getisLoading$ = this.select('isLoading')
  getPenddingOrders$ = this.service.getPendingOrders()
  getFinishedOrders$ = this.service.getFinishedOrders()

 
  constructor(
    protected override store: OrderStore,
    protected service: OrderService
    ) {
    super(store);
  }

  
}
