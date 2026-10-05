import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Order, OrderRequest } from 'src/interfaces/order.interface';

export interface OrderState {
  orders: Order[] | undefined;
  pendingOrders: Order[] | undefined;
  finishedOrders: Order[] | undefined;
}

const initialState: OrderState = {
  orders: undefined,
  pendingOrders: undefined,
  finishedOrders: undefined
};

export const OrderStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const http = inject(HttpClient);
    const url = environment.api + 'orders';
    let pending: Order[] = [];
    let finished: Order[] = [];

    function handleError(error: HttpErrorResponse, methodName?: string, obj?: unknown) {
      if (error.status === 0) {
        console.error('An error occurred:', error.error);
      } else {
        console.error(`Backend returned code ${error.status}, body was: `, error.error);
      }
      return throwError('Something went wrong, please try again later.' + methodName + ' ' + obj);
    }

    const postOrder = (order: OrderRequest) => http.post<Order>(url, order).pipe(
      catchError(err => handleError(err, 'postOrder', order))
    );

    return {
      /**
       * Rebuilds pending/finished as fresh arrays rather than pushing into the
       * existing ones - Akita used to deep-freeze arrays once written to
       * state, so pushing onto an already-frozen array would throw. Kept as
       * the safe pattern even though @ngrx/signals doesn't freeze by default.
       */
      getAll() {
        return http.get<Order[]>(url).pipe(
          tap(orders => {
            const newFinished = orders.filter(order => order.status === 'finished');
            const newPending = orders.filter(order => order.status !== 'finished');
            finished = [...finished, ...newFinished];
            pending = [...pending, ...newPending];
            patchState(store, {
              orders: pending.concat(finished),
              pendingOrders: pending,
              finishedOrders: finished
            });
          })
        );
      },

      /** Fetches a single order by id, or every order when `id` is omitted. */
      get(id?: string | number) {
        const getUrl = id ? `${url}/${id}` : url;
        return http.get<Order[]>(getUrl);
      },

      /** Creates a new order on the backend, then refreshes the local pending/finished buckets. */
      addOrder(newOrder: OrderRequest): void {
        pending = [];
        finished = [];
        postOrder(newOrder).subscribe();
        this.getAll().subscribe();
      },

      /** Updates the `status` field of the order with the given id. */
      updateStatusByOrderID(id: string | number, status: string): void {
        this.get(id).pipe(
          map(() => {
            http.patch<Order>(`${url}/${id}`, { status }).subscribe();
          })
        ).subscribe();
      },

      // since mock json server can't delete by the following url (as far as I know):
      // localhost:3000/orders?orderID=[number]
      // I need to run over all the orders and delete those that match the correct orderID
      // need to find a better way

      /** Deletes every order record matching the given business `orderID` (not the entity `id`). */
      deleteByOrderID(orderID: string | number): void {
        this.get().pipe(
          map(orders => {
            orders.forEach(item => {
              if (item.orderID === orderID) {
                http.delete<Order>(`${url}/${item.id}`).subscribe();
              }
            });
          })
        ).subscribe();
      }
    };
  }),
  withHooks({
    onInit(store) {
      store.getAll().subscribe();
    }
  })
);
