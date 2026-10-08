import { Flights } from "./flight.interface";
import { Hotel } from './hotel.interface';
import { Order } from "./order.interface";

export interface finalOrderRequest{
    hotel?: Hotel,
    flight?: Flights,
    order?: Order
}

export interface finalOrder{
    id: number,
    hotel?: Hotel,
    flight?: Flights,
    order?: Order
}