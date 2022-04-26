import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { Flights, FlightsRequest } from './my-flights';


@Injectable({
  providedIn: 'root'
})
export class MyFlightsService {

  private FLIGHTS: Flights[] = [];
  flightsArray: Flights[] = [];
  private _flight$: BehaviorSubject<Flights[]> = new BehaviorSubject(this.flightsArray);
  public flight$: Observable<Flights[]> = this._flight$.asObservable();
  private readonly FlightsServiceUrl = 'http://localhost:3000/' + 'flights';
 
  
  constructor(private http: HttpClient) {
    
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


   private postFlight(flight :FlightsRequest){
    return this.http.post<Flights>(this.FlightsServiceUrl, flight)
    .pipe(
      catchError(err => this.handleError(err, 'postFlight', flight))
    );
  }

  private _getFlights(){
    return this.http.get<Flights>(this.FlightsServiceUrl, {
    })
    .pipe(
      catchError(err => this.handleError(err, 'postFlight', ""))
    );
  }

  ngOnInit(): void {
  }

  
  addFlight(newFlight: FlightsRequest): void {
    this.postFlight(newFlight).subscribe(data => console.log(data))
  }

  getFlights(): Observable<Flights>{
    return this._getFlights()
  }
  
   

}
