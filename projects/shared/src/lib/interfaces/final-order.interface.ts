import { Flights } from "./flight.interface";
import { Hotel } from './hotel.interface';
import { Order } from "./order.interface";

export interface Feedback {
    hotelRating?: number,
    flightRating?: number,
    review?: string,
    ratedAt: string,
    /** Set by the admin to keep a review off the public page. */
    hidden?: boolean
}

export interface finalOrderRequest{
    hotel?: Hotel,
    flight?: Flights,
    order?: Order,
    bookedAt?: string
}

export interface finalOrder{
    id: number,
    hotel?: Hotel,
    flight?: Flights,
    order?: Order,
    bookedAt?: string,
    feedback?: Feedback
}