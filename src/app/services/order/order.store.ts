import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { 
  Order as orderInt 
} from 'src/interfaces/order.interface';
import { createOrder, Order } from './order.model';

export interface OrderState extends EntityState<Order, number>, ActiveState<number> {
  id?: number;
  orders?: orderInt[];
  pendingOrders?: orderInt[];
  finishedOrders?: orderInt[];
  isloading?: boolean;
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'order' })
export class OrderStore extends EntityStore<OrderState> {

  constructor() {
    super(createOrder({
      id: 1,
      isLoading: false
    }));
  }

}
