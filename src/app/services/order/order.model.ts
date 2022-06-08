import {  
  Order as orderInt
} from "src/interfaces/order.interface";

export interface Order {
  id?: number;
  orders?: orderInt[];
  pendingOrders?: orderInt[];
  finishedOrders?: orderInt[];
  isLoading?: boolean;
}

export function createOrder(params: Partial<Order>) {
  return {
    id: params.id,
    orders: params.orders,
    pendingOrders: params.pendingOrders,
    finishedOrders: params.finishedOrders,
    isLoading: false
  } as Order;
}
