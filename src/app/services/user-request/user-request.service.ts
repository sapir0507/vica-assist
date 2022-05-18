import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, Subscription, throwError } from 'rxjs';
import { Order, OrderRequest } from 'src/interfaces/order.interface';

@Injectable({
  providedIn: 'root'
})
export class userRequestService {

  private OrderArray: Order[] = [];
  private _order$: BehaviorSubject<Order[]> = new BehaviorSubject(this.OrderArray);
  public hotel$: Observable<Order[]> = this._order$.asObservable();
  private readonly HotelsServiceUrl = 'http://localhost:3000/' + 'orders';


  constructor(private http: HttpClient) { }

  private postOrder(order: OrderRequest){
    return this.http.post<Order>(this.HotelsServiceUrl, order).pipe(
      catchError(err => this.handleError(err, 'postOrder', order))
    );
  }

  private _getOrder(){
    return this.http.get<Order[]>(this.HotelsServiceUrl, {
    }).pipe(
      catchError(err => this.handleError(err, 'postOrder', ""))
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

  addOrder(newOrder: OrderRequest): Subscription {
      return this.postOrder(newOrder).subscribe(data=> console.log(data))
  }

  getOrders(): Observable<Order[]>{
    return this._getOrder()
  }
}
