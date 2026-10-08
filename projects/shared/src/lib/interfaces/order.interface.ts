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

  export function isPending(order: Order, isAgent: boolean): boolean {
    return order.status === 'pending' && isAgent;
  }
  export function isFinished(order: Order, isAgent: boolean): boolean {
    return order.status === 'finished' && !isAgent;
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
  