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
    departureDate?: string ,
    returnHour?: string,
    departureHour?: string,
    stops?: string ,
    stopDuration?: string,
    bagage?: string ,
    moreInfo?: string ,
    price?: number 
}

export interface FlightsRequest {
    orderID?: string,
    passangers?: number,
    fullName?: string,
    passID?: number,
    passArray?: passArray[],
    dest?: string ,
    org?: string ,
    returnDate?: string ,
    departureDate?: string ,
    returnHour?: string,
    departureHour?: string,
    stops?: string ,
    stopDuration?: string,
    bagage?: string ,
    moreInfo?: string ,
    price?: number 
    
}

export interface passArray{
    fullName:string,
    passID: number,
    id: number
}

export interface passArrayRequest{
    fullName:string,
    passID: number,
}