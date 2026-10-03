import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Flights, FlightsRequest } from 'src/app/interfaces/flight.interface';
import { BehaviorSubject, catchError, map, Observable, take, throwError } from 'rxjs';
import { ID } from '@datorama/akita';



/**
 * Client for the backend's `flights` endpoint used by the "add new flight"
 * (agent) flow and by the final-order flow to look up and clean up a
 * customer's flight choices.
 */
@Injectable({
  providedIn: 'root'
})
export class MyFlightsService {

  flightsArray: Flights[] = [];
  private _flight$: BehaviorSubject<Flights[]> = new BehaviorSubject(this.flightsArray);
  public flight$: Observable<Flights[]> = this._flight$.asObservable();
  private readonly FlightsServiceUrl = 'http://localhost:3000/';
 
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
    return this.http.post<Flights>(this.FlightsServiceUrl + 'flights', flight)
    .pipe(
      catchError(err => this.handleError(err, 'postFlight', flight))
    );
  }


  private _getFlights(){
    return this.http.get<Flights[]>(this.FlightsServiceUrl + 'flights', { })
    .pipe(
      catchError(err => this.handleError(err, 'postFlight', ""))
    );
  }

  private _flightByOrderID(orderID: string){
    const url = this.FlightsServiceUrl  + 'flights';
    let params: HttpParams = new HttpParams();
    params = params.append('orderID', orderID);
    return this.http.get<Flights[]>(url, {params}).pipe(  )
  } 

  ngOnInit(): void {
  }

  
  /** Creates a new flight listing on the backend. */
  addFlight(newFlight: FlightsRequest): void {
    this.postFlight(newFlight).subscribe(data => console.log(data))
  }

  /** Fetches every flight listing. */
  getFlights(): Observable<Flights[]>{
    return this._getFlights()
  }

  /** Fetches the flight listings associated with a given order id. */
  getFlightsByOrderID(orderID: string): Observable<Flights[]>{
    return this._flightByOrderID(orderID )
  }

  /** Appends a new, empty passenger `FormGroup` (full name + id) to a passenger `FormArray`. */
  createNewPassangerInput(fb: FormBuilder, newPassDetails: FormArray): void{
    const newPass: FormGroup = fb.group({
      fullName: ['', Validators.required],
      myID: ['', Validators.required]
    });

    newPassDetails.push(newPass);
  }

  /** Deletes a single flight listing by id. */
  deleteFlight(id: ID){
    return this.http.delete<Flights>(this.FlightsServiceUrl + `flights/${id}`).pipe(
      take(1),
      catchError(err => this.handleError(err, 'deleteFlight', ""))
    ).subscribe()
  }

  /** Deletes every flight listing associated with a given order id, once it's been finalized. */
  deleteFlightsByOrderID(orderID: string){
   this.getFlightsByOrderID(orderID).pipe(
     take(1),
     map(flights=>{
       flights.forEach(flight=>{
         flight.orderID === orderID? this.deleteFlight(flight.id) : ""
       })
     })
     ).subscribe()
    
  }
   


}
