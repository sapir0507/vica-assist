export interface Hotel {
    id: number,
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
  