import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { Ihotel, IhotelRequest } from './ihotel';

@Injectable({
  providedIn: 'root'
})
export class ShotelService {

  HOTELS: Ihotel[] | null = null;
  private hotelArray: Ihotel[] = [];
  private _hotel$: BehaviorSubject<Ihotel[]> = new BehaviorSubject(this.hotelArray);
  public hotel$: Observable<Ihotel[]> = this._hotel$.asObservable();
  private readonly HotelsServiceUrl = 'http://localhost:3000/hotels';


  constructor(private http: HttpClient) { }

  // getAreThereHotels(): boolean{
  //   return this.HOTELS? true: false;
  // }

  private postHotel(hotel: IhotelRequest){
    return this.http.post<Ihotel>(this.HotelsServiceUrl, hotel).pipe(
      catchError(err => this.handleError(err, 'postHotel', hotel))
    );
  }

  private _getHotel(){
    return this.http.get<Ihotel>(this.HotelsServiceUrl, {}).pipe(
      catchError(err => this.handleError(err, 'postHotel', ""))
    );
  }

  private handleError(error: HttpErrorResponse, methodName? : string, obj? : any) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError('Something went wrong, please try again later.' + methodName + ' ' + obj);
  }

  addHotel(newHotel: IhotelRequest): void {
      console.log("adding hotel -> service")
      console.log("value to add is:", newHotel)
      console.log("Adding...")
      // this.HOTELS? this.HOTELS.push(newHotel): this.HOTELS = [newHotel];
      this.postHotel(newHotel).subscribe(data=> console.log(data))
      console.log("HOTELS:", this.HOTELS)
  }

  getFlights(): Observable<Ihotel>{
    console.log("getting all hotels -> service")
    return this._getHotel()
  }

  getNewID(): number{
    return this.HOTELS? this.HOTELS.length : 0;
  }

  removeHotel(RHotelID: number):void{
    console.log("remove flight -> service")
    console.log("Removing flight...")
    if(this.HOTELS){
       this.HOTELS = this.HOTELS?.filter(hotel => hotel.id != RHotelID)
    }
    console.log("HOTELS:", this.HOTELS)
  }

  getFlight(HotelID: number){
    const result = this.HOTELS?.filter(hotel => hotel.id === HotelID)
    console.log("flight with id:", HotelID, "is:", result)
    return result; 
  }
}
