import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { Hotel, HotelRequest } from './ihotel';

@Injectable({
  providedIn: 'root'
})
export class ShotelService {

  HOTELS: Hotel[] | null = null;
  private hotelArray: Hotel[] = [];
  private _hotel$: BehaviorSubject<Hotel[]> = new BehaviorSubject(this.hotelArray);
  public hotel$: Observable<Hotel[]> = this._hotel$.asObservable();
  private readonly HotelsServiceUrl = 'http://localhost:3000/hotels';


  constructor(private http: HttpClient) { }

  private postHotel(hotel: HotelRequest){
    return this.http.post<Hotel>(this.HotelsServiceUrl, hotel).pipe(
      catchError(err => this.handleError(err, 'postHotel', hotel))
    );
  }

  private _getHotel(){
    return this.http.get<Hotel>(this.HotelsServiceUrl, {}).pipe(
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

  addHotel(newHotel: HotelRequest): void {
      this.postHotel(newHotel).subscribe(data=> console.log(data))
  }

  getHotels(): Observable<Hotel>{
    return this._getHotel()
  }

  getNewID(): number{
    return this.HOTELS? this.HOTELS.length : 0;
  }

  getFlight(FlightID: number){
    const result = this.HOTELS?.filter(hotel => hotel.id === FlightID)
    return result; 
  }
}
