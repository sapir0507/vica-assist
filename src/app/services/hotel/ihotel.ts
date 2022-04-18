export interface Ihotel {
      id: number,
      Name?:  string,
      stars?: number,
      breakfast?: boolean,
      bedsIncluded?: string,
      price?: number
}

export interface IhotelRequest {
      Name?:  string,
      stars?: number,
      breakfast?: boolean,
      bedsIncluded?: string,
      price?: number
}