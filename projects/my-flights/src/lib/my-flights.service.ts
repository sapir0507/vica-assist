import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Flights, FlightsRequest } from 'src/app/interfaces/flight.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpResourceService } from 'src/app/services/http-resource/http-resource.service';

/**
 * Client for the backend's `flights` endpoint used by the "add new flight"
 * (agent) flow and by the final-order flow to look up and clean up a
 * customer's flight choices.
 */
@Injectable({
  providedIn: 'root'
})
export class MyFlightsService extends HttpResourceService<Flights, FlightsRequest> {

  flightsArray: Flights[] = [];
  private _flight$: BehaviorSubject<Flights[]> = new BehaviorSubject(this.flightsArray);
  public flight$: Observable<Flights[]> = this._flight$.asObservable();
  protected readonly resourceUrl = environment.api + 'flights';

  constructor(http: HttpClient) {
    super(http);
  }

  ngOnInit(): void {/* empty*/}

  /** Creates a new flight listing on the backend. */
  addFlight(newFlight: FlightsRequest): void {
    this.create(newFlight).subscribe(data => console.log(data));
  }

  /** Fetches every flight listing. */
  getFlights(): Observable<Flights[]> {
    return this.getAll();
  }

  /** Fetches the flight listings associated with a given order id. */
  getFlightsByOrderID(orderID: string): Observable<Flights[]> {
    return this.getByOrderID(orderID);
  }

  /** Appends a new, empty passenger `FormGroup` (full name + id) to a passenger `FormArray`. */
  createNewPassangerInput(fb: FormBuilder, newPassDetails: FormArray): void {
    const newPass: FormGroup = fb.group({
      fullName: ['', Validators.required],
      myID: ['', Validators.required]
    });

    newPassDetails.push(newPass);
  }

  /** Deletes a single flight listing by id. */
  deleteFlight(id: number): void {
    this.deleteById(id);
  }

  /** Deletes every flight listing associated with a given order id, once it's been finalized. */
  deleteFlightsByOrderID(orderID: string): void {
    this.deleteByOrderID(orderID);
  }
}
