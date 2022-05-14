export interface Hotel {
    id: number,
    name?: string,
    stars?: number,
    guests?: number,
    breakfast?: boolean,
    bedType?: string,
    images?: string,
    moreInfo?: string,
    price?: number
  }
  
  export interface HotelRequest {
    name?: string,
    stars?: number,
    guests?: number,
    breakfast?: boolean,
    bedType?: string,
    images?: string,
    moreInfo?: string,
    price?: number
  }
  