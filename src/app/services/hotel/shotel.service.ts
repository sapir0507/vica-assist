import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Hotel, HotelRequest } from './ihotel';

/**
 * Client for the backend's `hotels` endpoint.
 *
 * This duplicates `HotelsService` (projects/my-hotels); the app currently
 * books hotels through that library service instead, so this one is kept
 * for backward compatibility with any code still depending on it.
 */
@Injectable({
  providedIn: 'root'
})
export class ShotelService {

  HOTELS: Hotel[] | null = null;
  private hotelArray: Hotel[] = [];
  private _hotel$: BehaviorSubject<Hotel[]> = new BehaviorSubject(this.hotelArray);
  public hotel$: Observable<Hotel[]> = this._hotel$.asObservable();
  private readonly HotelsServiceUrl = environment.api + 'hotels';


  constructor(private http: HttpClient) { }

  private postHotel(hotel: HotelRequest){
    return this.http.post<Hotel>(this.HotelsServiceUrl, hotel).pipe(
      catchError(err => this.handleError(err, 'postHotel', hotel))
    );
  }

  private _hotelByOrderID(orderID: string){
    const url = this.HotelsServiceUrl ;
    let params: HttpParams = new HttpParams();
    params = params.append('orderID', orderID);
    return this.http.get<Hotel[]>(url, {params}).pipe(  )
  } 

  private _getHotel(){
    return this.http.get<Hotel[]>(this.HotelsServiceUrl, {}).pipe(
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

  /** Creates a new hotel listing on the backend. */
  addHotel(newHotel: HotelRequest): void {
      this.postHotel(newHotel).subscribe(data=> console.log(data))
  }

  /** Fetches every hotel listing. */
  getHotels(): Observable<Hotel[]>{
    return this._getHotel()
  }

  /** Fetches the hotel listings associated with a given order id. */
  getHotelsByOrderID(orderID: string): Observable<Hotel[]>{
    return this._hotelByOrderID(orderID)
  }

  /** Returns the number of locally cached hotels, used as a naive next-id hint. */
  getNewID(): number{
    return this.HOTELS? this.HOTELS.length : 0;
  }

  /** Looks up a locally cached hotel by id. Returns `undefined` until `HOTELS` has been populated. */
  getFlight(FlightID: number){
    const result = this.HOTELS?.filter(hotel => hotel.id === FlightID)
    return result;
  }
}
