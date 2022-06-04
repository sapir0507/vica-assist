import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { setLoading } from '@datorama/akita';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Order as OrderInt } from 'src/interfaces/order.interface';
import { Order } from './order.model';
import { OrderStore } from './order.store';



@Injectable({ providedIn: 'root' })
export class OrderService {

  private url: string = environment.api + 'orders'

  constructor(
    private orderStore: OrderStore, 
    private http: HttpClient) {
      
    }


    get() {
    let params: HttpParams = new HttpParams();
    // params = params.append()
    return this.http.get<OrderInt[]>(this.url,{params}).pipe(
      setLoading(this.orderStore),
      tap(entities => {
        this.orderStore.set(entities);
      })
    );
  }


  getOrders(){
    return this.get()
  }

  getFinishedOrders(){
    return this.get().pipe(
      map(ordersArray=>ordersArray.filter(order => order.status === 'finished'))
    )
  }

  getPendingOrders(){
    return this.get().pipe(
      map(ordersArray=>ordersArray.filter(order => order.status === 'pending'))
    )
  }

           

}
