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
    destination: string,
    passDetails: passDetails[],
    stars?: number,
    priceRange: number ,
    finalPrice?: number
  }
  
  export interface OrderRequest {
    orderID?: string,
    choice: string,
    status: string,
    departureDate: string,
    returnDate: string,
    origin: string,
    destination: string,
    passDetails: passDetails[],
    stars?: number,
    priceRange: number,
    finalPrice?: number

  }
  