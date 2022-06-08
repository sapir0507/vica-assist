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

  get(orderID?: number, id?: number) {
    let params: HttpParams = new HttpParams();
    id? params.append('id', id): ''
    orderID? params.append('orderID', orderID): ''
    return this.http.get<finalOrder[]>(this.final_url, {params})
    .pipe(
      tap(entities => {
      this.finalOrderStore.set(entities);
    }));
  }

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

  update(id: number, finalOrder: Partial<finalOrder>) {
    this.finalOrderStore.update(id, finalOrder);
  }

  remove(id: number) {
    this.finalOrderStore.remove(id);
  }

  removeOrder(){
    let params: HttpParams = new HttpParams();
    this.http.delete<Order>(this.order_url, {params}).pipe(take(1)).subscribe();
  }
}
