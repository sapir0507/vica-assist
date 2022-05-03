export interface Flights {
    id: number,
    passangers?: number,
    fullName?: string,
    passID?: number,
    passArray?: passArray[],
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
    passangers?: number,
    fullName?: string,
    passID?: number,
    passArray?: passArray[],
    dest?: string ,
    org?: string ,
    returnDate?: string ,
    departureDate?: string ,
    stops?: string ,
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