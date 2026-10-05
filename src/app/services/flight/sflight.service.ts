import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Flights, FlightsRequest } from 'src/app/interfaces/flight.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpResourceService } from 'src/app/services/http-resource/http-resource.service';

/**
 * Client for the backend's `flights` endpoint, used by the "choose flight"
 * screen to list and pick flights for an order.
 */
@Injectable({
  providedIn: 'root'
})
export class SflightService extends HttpResourceService<Flights, FlightsRequest> {
  protected readonly resourceUrl = environment.api + 'flights';

  constructor(http: HttpClient) {
    super(http);
  }

  /** Creates a new flight listing on the backend. */
  addFlight(newFlight: FlightsRequest): void {
    this.create(newFlight).subscribe(data => console.log(data));
  }

  /** Fetches every flight listing. */
  getFlights(): Observable<Flights[]> {
    return this.getAll();
  }

  /**
   * Fetches the flight listings associated with a given order id, despite
   * the parameter being named `FlightID` for historical reasons.
   */
  getFlight(FlightID: number): Observable<Flights[]> {
    return this.getByOrderID(String(FlightID));
  }
}
