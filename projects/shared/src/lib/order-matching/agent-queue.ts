import { Order } from '../interfaces/order.interface';

/** An agent sees their own requests, and the older ones that were never assigned to anybody. */
export const isVisibleToAgent = (order: Pick<Order, 'agent'> | undefined, username: string): boolean =>
  !!order && (!order.agent || order.agent === username);
