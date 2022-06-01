import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Flights, FlightsRequest } from 'src/app/interfaces/flight.interface';
import { BehaviorSubject, catchError, observable, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SflightService {

  private FLIGHTS: Flights[] = [];
  flightsArray: Flights[] = [];
  private _flight$: BehaviorSubject<Flights[]> = new BehaviorSubject(this.flightsArray);
  public flight$: Observable<Flights[]> = this._flight$.asObservable();
  private readonly FlightsServiceUrl = environment.api + 'flights';

  constructor(private http: HttpClient) { }

  private postFlight(flight :FlightsRequest){
    return this.http.post<Flights>(this.FlightsServiceUrl, flight)
    .pipe(
      catchError(err => this.handleError(err, 'postFlight', flight))
    );
  }

  private _getFlights(){
    return this.http.get<Flights[]>(this.FlightsServiceUrl)
    .pipe(
      catchError(err => this.handleError(err, 'getFlight', ""))
    );
  }

  
  private _getFlight(orderID: number){
    let params: HttpParams = new HttpParams();
    params = params.append("orderID", orderID)
    return this.http.get<Flights[]>(this.FlightsServiceUrl, {params})
    .pipe(
      catchError(err => this.handleError(err, 'getFlight', ""))
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

  addFlight(newFlight: FlightsRequest): void {  
      this.postFlight(newFlight).subscribe(data => console.log(data))  
  }

  getFlights(): Observable<Flights[]>{
    return this._getFlights()
  }

  getFlight(FlightID: number){
    // const result = this.FLIGHTS?.filter(flight => flight.id === FlightID)
    // return result; 
    return this._getFlight(FlightID)
  }

}
