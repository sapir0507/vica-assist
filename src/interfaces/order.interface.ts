export interface passDetails{
    fullName: string,
    passID: number
}

export interface Order {
    id: number,
    choice: string,
    departureDate: string,
    returnDate: string,
    origin: string,
    destination: string,
    passDetails: passDetails[],
    stars?: number,
    priceRange: number 
  }
  
  export interface OrderRequest {
    choice: string,
    departureDate: string,
    returnDate: string,
    origin: string,
    destination: string,
    passDetails: passDetails[],
    stars?: number,
    priceRange: number 
  }
  