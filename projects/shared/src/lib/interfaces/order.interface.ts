import { Assignment } from './agent.interface';
import { OrderPreferences } from './preferences.interface';

export enum OrderStatus {
  Pending = 'pending',
  Finished = 'finished',
  Cancelled = 'cancelled',
  Booked = 'booked'
}

export interface passDetails{
    fullName: string,
    passID: number
}

export interface Order {
    id: number,
    orderID: string,
    choice: string,
    status: string,
    departureDate: string,
    returnDate: string,
    origin: string,
    /** The destination's name when the order was saved; `destinationId` says which destination it is. */
    destination: string,
    destinationId: string,
    passDetails: passDetails[],
    stars?: number,
    priceRange: number ,
    finalPrice?: number,
    customer?: string,
    createdAt?: string,
    respondedAt?: string,
    updatedAt?: string,
    cancelledAt?: string,
    agent?: string,
    assignedAt?: string,
    assignments?: Assignment[],
    preferences?: OrderPreferences
  }

  export function isPending(order: Order, isAgent: boolean): boolean {
    return order.status === OrderStatus.Pending && isAgent;
  }
  export function isFinished(order: Order, isAgent: boolean): boolean {
    return order.status === OrderStatus.Finished && !isAgent;
  }

  export interface OrderRequest {
    id?: number,
    orderID?: string,
    choice: string,
    status: string,
    departureDate: string,
    returnDate: string,
    origin: string,
    destination: string,
    destinationId: string,
    passDetails: passDetails[],
    stars?: number,
    priceRange: number,
    finalPrice?: number,
    customer?: string,
    createdAt?: string,
    agent?: string,
    assignedAt?: string,
    assignments?: Assignment[],
    preferences?: OrderPreferences

  }
  