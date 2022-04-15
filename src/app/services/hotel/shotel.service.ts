import { Injectable } from '@angular/core';
import { Ihotel } from './ihotel';

@Injectable({
  providedIn: 'root'
})
export class ShotelService {

  HOTELS: Ihotel[] | null = null;
  constructor() { }

  getAreThereHotels(): boolean{
    return this.HOTELS? true: false;
  }

  addHotel(newFlight: Ihotel): void {
      console.log("adding hotel -> service")
      console.log("value to add is:", newFlight)
      console.log("Adding...")
      this.HOTELS? this.HOTELS.push(newFlight): this.HOTELS = [newFlight];
      console.log("HOTELS:", this.HOTELS)
  }

  getNewID(): number{
    return this.HOTELS? this.HOTELS.length : 0;
  }

  removeHotel(RHotelID: number):void{
    console.log("remove flight -> service")
    console.log("Removing flight...")
    if(this.HOTELS){
       this.HOTELS = this.HOTELS?.filter(hotel => hotel.hotelID != RHotelID)
    }
    console.log("HOTELS:", this.HOTELS)
  }

  getFlight(HotelID: number){
    const result = this.HOTELS?.filter(hotel => hotel.hotelID === HotelID)
    console.log("flight with id:", HotelID, "is:", result)
    return result; 
  }
}
