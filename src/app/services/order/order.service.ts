import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ID, setLoading } from '@datorama/akita';
import { Subscription, throwError } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Order as OrderInt, OrderRequest } from 'src/interfaces/order.interface';
import { OrderStore } from './order.store';



@Injectable({ providedIn: 'root' })
export class OrderService {

  private url: string = environment.api + 'orders'
  private finished: OrderInt[] = [];
  private pending: OrderInt[] = [];

  constructor(
    private orderStore: OrderStore, 
    private http: HttpClient) {
      this.getAll().subscribe()

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


    private updateOrderStore(){
      if(this.finished && this.pending){
        let AllOrders = this.pending.concat(this.finished)
        this.orderStore.update((state)=>({
          ...state,
          pendingOrders: this.pending,
          finishedOrders: this.finished,
          orders: AllOrders
        }))
      }
    }

    getAll(){
        return this.http.get<OrderInt[]>(this.url).pipe(
          setLoading(this.orderStore),
          take(1),
          tap(orders=>{
            orders.forEach(order=>{
              if(order.status==='finished') this.finished.push(order)
              else this.pending.push(order)
            })
            this.updateOrderStore()
          })
        );
    }

    get(id?: ID) {
      console.log("order -> get orders", this.orderStore)
      let url: ID = id? this.url + `/${id}`: this.url;
      return this.http.get<OrderInt[]>(url).pipe(
        setLoading(this.orderStore),
        take(1)
      );
    }

    private postOrder(order: OrderRequest){
      return this.http.post<OrderInt>(this.url, order).pipe(
        catchError(err => this.handleError(err, 'postOrder', order))
      );
    }

    
    addOrder(newOrder: OrderRequest): Subscription {
      return this.postOrder(newOrder).pipe(take(1)).subscribe()
    }

    //updates the status of a spacific order inside the mock json server 
    updateStatusByOrderID(id: ID, status: string){
      this.get(id).pipe(
        take(1),
        map(() => {
            this.http.patch<OrderInt>(this.url + `/${id}`, {
              status: status
            }).pipe(take(1)).subscribe()
        })
      ).subscribe()
    }

  //since mock json server can't delete by the following url (as far as I know):
  // localhost:3000/orders?orderID=[number]
  // I need to run over all the orders and delete those that match the correct orderID

  //need to find a better way

    deleteByOrderID(orderID: ID){
      this.get().pipe(
        take(1),
        map(order=>{
          order.forEach(item=>{
            item.orderID === orderID? this.deleteOrdersByID(item.id) : ""
          })
        })
      ).subscribe()
    }

    deleteOrdersByID(id: ID){
      return this.http.delete<OrderInt>(this.url + `/${id}`).pipe(
        take(1),
        setLoading(this.orderStore)
      ).subscribe()
    }
  

           

}
