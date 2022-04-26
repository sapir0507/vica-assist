export interface Flights {
    id: number,
    passangers?: number ,
    dest?: string ,
    org?: string ,
    returnDate?: string ,
    departureDate?: string ,
    stops?: string ,
    bagage?: string ,
    moreInfo?: string ,
    price?: number 
}

export interface FlightsRequest {
    passangers?: number ,
    dest?: string ,
    org?: string ,
    returnDate?: string ,
    departureDate?: string ,
    stops?: string ,
    bagage?: string ,
    moreInfo?: string ,
    price?: number 
    
}