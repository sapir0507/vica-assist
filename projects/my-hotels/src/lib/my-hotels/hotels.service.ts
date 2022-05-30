import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, Subscription, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http'
import { Hotel, HotelRequest } from 'src/app/interfaces/hotel.interface';


@Injectable({
  providedIn: 'root'
})
export class HotelsService {
  HOTELS?: HotelRequest[];
  private hotelArray?: Hotel[] = [];
  private _hotel$: BehaviorSubject<Hotel[] | undefined> = new BehaviorSubject(this.hotelArray);
  public hotel$: Observable<Hotel[] | undefined> = (this._hotel$.asObservable());
  private env = 'http://localhost:3000'; 
  private readonly HotelsServiceUrl = this.env +'/hotels';
  
  constructor(private http: HttpClient) { }


  private postHotel(hotel: HotelRequest){
    return this.http.post<Hotel>(this.HotelsServiceUrl, hotel).pipe(
      catchError(err => this.handleError(err, 'postHotel', hotel))
    );
  }

  private _getHotel(){
    return this.http.get<Hotel[]>(this.HotelsServiceUrl, {}).pipe(
      catchError(err => this.handleError(err, 'postHotel', ""))
    );
  }
  
  private _hotelByOrderID(orderID: string){
    const url = this.HotelsServiceUrl ;
    let params: HttpParams = new HttpParams();
    params = params.append('orderID', orderID);
    return this.http.get<Hotel[]>(url, {params}).pipe(  )
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

  addHotel(newHotel: HotelRequest): Subscription {
      return this.postHotel(newHotel).subscribe(data=> console.log(data))
  }

  getHotels(): Observable<Hotel[]>{
    return this._getHotel()
  }

  getHotelsByOrderID(orderID: string): Observable<Hotel[]>{
    return this._hotelByOrderID(orderID)
  }

}
