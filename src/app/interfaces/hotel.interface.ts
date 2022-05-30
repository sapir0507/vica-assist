export interface Hotel {
    id: number,
    orderID?: string,
    name?: string,
    stars?: number,
    guests?: number,
    breakfast?: boolean,
    bedType?: string,
    image?: string,
    images?: FormData,
    moreInfo?: string,
    price?: number
  }
  
  export interface HotelRequest {
    orderID?: string,
    name?: string,
    stars?: number,
    guests?: number,
    breakfast?: boolean,
    bedType?: string,
    image?: string,
    images?: FormData,
    moreInfo?: string,
    price?: number
  }
  