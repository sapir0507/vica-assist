import { Order } from '../interfaces/order.interface';

export const requestNumber = (order: Pick<Order, 'id'>): string => `VA-${String(order.id).padStart(6, '0')}`;
