export interface Hotel {
      id: number,
      Name?:  string,
      stars?: number,
      breakfast?: boolean,
      bedsIncluded?: string,
      price?: number
}

export interface HotelRequest {
      Name?:  string,
      stars?: number,
      breakfast?: boolean,
      bedsIncluded?: string,
      price?: number
}