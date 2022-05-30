import { passArray } from "./pass-array.interface"

export interface Flights {
    id: number,
    orderID?: string,
    passangers?: number,
    fullName?: string,
    passID?: number,
    passArray?: passArray[],
    dest?: string ,
    org?: string ,
    returnDate?: string ,
    returnHour?: string,
    departureDate?: string ,
    departureHour?: string,
    stops?: string ,
    stopDuration?: string,
    bagage?: string ,
    moreInfo?: string ,
    price?: number
  }

  export interface FlightsRequest {
    passangers?: number,
    orderID?: string,
    fullName?: string,
    passID?: number,
    passArray?: passArray[],
    dest?: string ,
    org?: string ,
    returnDate?: string ,
    returnHour?: string,
    departureDate?: string,
    departureHour?: string,
    stops?: string ,
    stopDuration?: string,
    bagage?: string ,
    moreInfo?: string ,
    price?: number 
    
}
