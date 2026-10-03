import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ID, setLoading } from '@datorama/akita';
import { Subscription, throwError } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Order as OrderInt, OrderRequest } from 'src/interfaces/order.interface';
import { OrderStore } from './order.store';


/**
 * Client for the backend's `orders` endpoint. Keeps the Akita `OrderStore`
 * in sync, splitting orders into `pending` (not yet matched with a
 * flight/hotel) and `finished` buckets as they're fetched.
 */
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

    /**
     * Fetches all orders and splits them into the `pending` and `finished`
     * buckets (by `status`) before pushing the result into the store.
     *
     * Builds fresh arrays rather than mutating `this.pending`/`this.finished`
     * in place: Akita deep-freezes the state objects it's handed in dev
     * mode, and those same array instances get stored as `pendingOrders` /
     * `finishedOrders` - pushing onto an already-frozen array throws, which
     * silently broke every `getAll()` call after the first.
     */
    getAll(){
        return this.http.get<OrderInt[]>(this.url).pipe(
          setLoading(this.orderStore),
          take(1),
          tap(orders=>{
            const newFinished = orders.filter(order => order.status === 'finished');
            const newPending = orders.filter(order => order.status !== 'finished');
            this.finished = [...this.finished, ...newFinished];
            this.pending = [...this.pending, ...newPending];
            this.updateOrderStore()
          })
        );
    }

    /** Fetches a single order by id, or every order when `id` is omitted. */
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

    
    /** Creates a new order on the backend, then refreshes the local pending/finished buckets. */
    addOrder(newOrder: OrderRequest): Subscription {
      this.pending = []
      this.finished = []
      var a =  this.postOrder(newOrder).pipe(take(1)).subscribe()
      this.getAll().subscribe()
      return a
    }

    //updates the status of a spacific order inside the mock json server
    /** Updates the `status` field of the order with the given id. */
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

    /** Deletes every order record matching the given business `orderID` (not the entity `id`). */
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
