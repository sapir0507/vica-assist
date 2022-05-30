import {  
  Order as orderInt
} from "src/interfaces/order.interface";

export interface Order {
  id?: number;
  order?: orderInt;
  isLoading?: boolean;
}

export function createOrder(params: Partial<Order>) {
  return {
    id: params.id,
    order: params.order,
    isLoading: false
  } as Order;
}
