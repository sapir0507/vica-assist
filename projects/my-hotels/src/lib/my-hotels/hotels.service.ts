import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_URL, Hotel, HotelRequest, HttpResourceService } from '@vica-assist/shared';

/**
 * Client for the backend's `hotels` endpoint used by the "add new hotel"
 * (agent) flow and by the final-order flow to look up and clean up a
 * customer's hotel choice.
 */
@Injectable({
  providedIn: 'root'
})
export class HotelsService extends HttpResourceService<Hotel, HotelRequest> {
  HOTELS?: HotelRequest[];
  private hotelArray?: Hotel[] = [];
  private _hotel$: BehaviorSubject<Hotel[] | undefined> = new BehaviorSubject(this.hotelArray);
  public hotel$: Observable<Hotel[] | undefined> = (this._hotel$.asObservable());
  protected readonly resourceUrl = inject(API_URL) + 'hotels';

  constructor(http: HttpClient) {
    super(http);
  }

  /** Creates a new hotel listing on the backend. */
  addHotel(newHotel: HotelRequest): Subscription {
    return this.create(newHotel).subscribe(data => console.log(data));
  }

  /** Fetches every hotel listing. */
  getHotels(): Observable<Hotel[]> {
    return this.getAll();
  }

  /** Fetches the hotel listings associated with a given order id. */
  getHotelsByOrderID(orderID: number): Observable<Hotel[]> {
    return this.getByOrderID(String(orderID));
  }

  /** Deletes every hotel listing associated with a given order id, once it's been finalized. */
  deleteHotel(orderID: string): void {
    this.deleteByOrderID(orderID);
  }

  /** Deletes a single hotel listing by id. */
  deleteHotelById(id: number): void {
    this.deleteById(id);
  }
}
