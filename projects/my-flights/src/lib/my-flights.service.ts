import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IFlight, IFlightRequest } from './my-flights.interface';

@Injectable({
  providedIn: 'root'
})
export class MyFlightsService {

  private flightsArray: IFlight[] = [];
  private _flight$: BehaviorSubject<IFlight[]> = new BehaviorSubject(this.flightsArray);
  public flight$: Observable<IFlight[]> = this._flight$.asObservable();
  private readonly FlightsServiceUrl = environment.api + 'flights';


  constructor(private http: HttpClient) { }

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

  private postFlight(flight :IFlightRequest){
    // this function gets a new flight and adds it to the local json server using a http post request. 
    return this.http.post<IFlight>(this.FlightsServiceUrl, flight)
    .pipe(
      catchError(err => this.handleError(err, 'postFlight', flight))
    );
  }


  private _getFlights(){
    //this function returns all the flights currently in the local json server
    return this.http.get<IFlight>(this.FlightsServiceUrl, {
    })
    .pipe(
      catchError(err => this.handleError(err, 'getFlight', ""))
    );
  }

  addFlight(newFlight: IFlightRequest): void {
    // this function adds newFlight to the local json server using observables
    this.postFlight(newFlight).subscribe(data => console.log(data))
}



}
