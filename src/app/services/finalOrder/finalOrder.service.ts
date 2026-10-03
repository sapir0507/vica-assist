import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MyFlightsService } from 'projects/my-flights/src';
import { HotelsService } from 'projects/my-hotels/src/lib/my-hotels/hotels.service';
import { take, tap } from 'rxjs/operators';
import { Order } from 'src/app/interfaces/order.interface';
import { environment } from 'src/environments/environment';
import { OrderService } from '../order/order.service';
import { OrderStore } from '../order/order.store';
import { finalOrder, finalOrderRequest } from './finalOrder.model';
import { finalOrderStore } from './finalOrder.store';

/**
 * Coordinates the "final order" flow: the combined order + flight + hotel
 * selection a customer confirms once both parts of their trip are chosen.
 *
 * Persists the finished order to the `finalOrder` endpoint and cleans up the
 * now-obsolete pending order/flight/hotel records that the booking was built
 * from (so they stop showing up as "pending").
 */
@Injectable({ providedIn: 'root' })
export class finalOrderService {

  private final_url: string = environment.api + 'finalOrder';
  private order_url: string = environment.api + 'order';


  constructor(
    private finalOrderStore: finalOrderStore, 
    private order: OrderStore,
    private orderService: OrderService,
    private flightService: MyFlightsService,
    private hotelService: HotelsService,
    private http: HttpClient
    ) {
  }

  private postfinalOrder(request: finalOrderRequest){
    return this.http.post<finalOrderRequest>(this.final_url, request).pipe();
  }

  /**
   * Persists a completed order (order + flight and/or hotel) as a final
   * order, then deletes the pending order/flight/hotel records it was
   * assembled from so they no longer appear as in-progress.
   */
  addfinalOrder(newRequest: finalOrderRequest): void{
    try {
      const orderID = newRequest.order?.orderID
      try {
        orderID?
        this.orderService.deleteByOrderID(orderID) : ""
      } catch (error) {
        console.log("final order -> order service", error)
      }
      try {
        orderID?
        this.hotelService.deleteHotel(orderID) : ""
      } catch (error) {
        console.log("final order -> my flights service", error)
      }
      try {
        orderID?
        this.flightService.deleteFlightsByOrderID(orderID) : ""
      } catch (error) {
        console.log("final order -> hotels service", error)
      }
      this.postfinalOrder(newRequest).subscribe(data=>console.log(data))
    } catch (error) {
      console.log(error)
      console.log("newRequest: ", newRequest, "type: ", typeof(newRequest))
    }
  }

  /**
   * Fetches final orders, optionally filtered by order id and/or final-order
   * id, and loads the result into the store.
   *
   * `HttpParams` is immutable, so each `.append()` call must be reassigned -
   * previously the filters were built but discarded, and every call
   * returned the unfiltered list.
   */
  get(orderID?: number, id?: number) {
    let params: HttpParams = new HttpParams();
    if (id) params = params.append('id', id);
    if (orderID) params = params.append('orderID', orderID);
    return this.http.get<finalOrder[]>(this.final_url, {params})
    .pipe(
      tap(entities => {
      this.finalOrderStore.set(entities);
    }));
  }

  /** Adds a final order to the local store and removes its source order from the order store. */
  add(finalOrder: finalOrder) {
    const id = finalOrder.order?.id
    if(id){
      try {
        this.order.remove(id)
      } catch (error) {
        console.log(error)
      }
    }
    this.finalOrderStore.add(finalOrder);
  }

  /** Merges `finalOrder` into the entity with the given id in the local store. */
  update(id: number, finalOrder: Partial<finalOrder>) {
    this.finalOrderStore.update(id, finalOrder);
  }

  /** Removes the entity with the given id from the local store. */
  remove(id: number) {
    this.finalOrderStore.remove(id);
  }

  /** Deletes the current order from the backend's `order` endpoint. */
  removeOrder(){
    let params: HttpParams = new HttpParams();
    this.http.delete<Order>(this.order_url, {params}).pipe(take(1)).subscribe();
  }
}
