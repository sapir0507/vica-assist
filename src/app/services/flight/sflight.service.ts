import { HttpClient, HttpErrorResponse, JsonpClientBackend } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, observable, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IFlight, IFlightRequest } from './iflight';

@Injectable({
  providedIn: 'root'
})
export class SflightService {

  private FLIGHTS: IFlight[] = [];
  flightsArray: IFlight[] = [];
  private _flight$: BehaviorSubject<IFlight[]> = new BehaviorSubject(this.flightsArray);
  public flight$: Observable<IFlight[]> = this._flight$.asObservable();
  private readonly FlightsServiceUrl = environment.api + 'flights';

  constructor(private http: HttpClient) { }

  private postFlight(flight :IFlightRequest){
    return this.http.post<IFlight>(this.FlightsServiceUrl, flight)
    .pipe(
      catchError(err => this.handleError(err, 'postFlight', flight))
    );
  }

  private _getFlights(){
    return this.http.get<IFlight>(this.FlightsServiceUrl, {
      

    })
    .pipe(
      catchError(err => this.handleError(err, 'postFlight', ""))
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


  // getAreThereFlights(): boolean{

  //   return this.FLIGHTS? true: false;
  // }

  addFlight(newFlight: IFlightRequest): void {
      console.log("adding flight -> service")
      console.log("value to add is:", newFlight)
      console.log("Adding...")
      // this._flight$.next([...this._flight$.getValue(), newFlight])
      this.postFlight(newFlight).subscribe(data => console.log(data))
      // this.FLIGHTS? this.FLIGHTS.push(newFlight): this.FLIGHTS = [newFlight];
      console.log("FLIGHTS:", this.flightsArray)
  }


  getFlights(): Observable<IFlight>{
    console.log("getting all flights -> service")
    return this._getFlights()
  }
  // getNewID(): number{
  //   return this.FLIGHTS? this.FLIGHTS.length : 0;
  // }

  removeFlight(RFlightID: number):void{
    console.log("remove flight -> service")
    console.log("Removing flight...")
    if(this.flightsArray){
       this.flightsArray = this.flightsArray?.filter(flight => flight.id != RFlightID)
    }
    console.log("FLIGHTS:", this.FLIGHTS)
  }

  getFlight(FlightID: number){
    const result = this.FLIGHTS?.filter(flight => flight.id === FlightID)
    console.log("flight with id:", FlightID, "is:", result)
    return result; 
  }

  // getCities(){
  //   //get list of 10 cities
  // }
  // getCountries(){
  //   //get list of 10 countries
  // }
  // getAirways(){
  //   //get list of 10 airways
  // }
  // getAirport_landing(){}

}
