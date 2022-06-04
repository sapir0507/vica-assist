import { EntityState, ActiveState } from '@datorama/akita';
import { Flights } from 'src/interfaces/flight.interface';
import { Hotel } from 'src/interfaces/hotel.interface';
import { Order } from 'src/interfaces/order.interface';

export interface finalOrderRequest extends EntityState<finalOrder, number>, ActiveState<number> {
  order?: Order;
  flight?: Flights;
  hotel?: Hotel;
}

export interface finalOrder extends EntityState<finalOrder, number>, ActiveState<number> {
  id?: number | string;
  order?: Order;
  flight?: Flights;
  hotel?: Hotel;
}

export function createfinalOrder(params: Partial<finalOrder>) {
  return {
    id: params.id,
    order: params.order,
    flight: params.flight,
    hotel: params.hotel,
    active: params.active,
    loading: params.loading
  
  } as finalOrder;
}
