import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { Observable, forkJoin, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AssignmentReason, Order, OrderRequest } from '@vica-assist/shared';

export interface OrderState {
  orders: Order[] | undefined;
  pendingOrders: Order[] | undefined;
  finishedOrders: Order[] | undefined;
  cancelledOrders: Order[] | undefined;
}

const initialState: OrderState = {
  orders: undefined,
  pendingOrders: undefined,
  finishedOrders: undefined,
  cancelledOrders: undefined
};

export const OrderStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const http = inject(HttpClient);
    const url = environment.api + 'orders';

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
      /** Replaces the pending/finished buckets with what the backend holds now. */
      getAll() {
        return http.get<Order[]>(url).pipe(
          tap(orders => {
            const finished = orders.filter(order => order.status === 'finished');
            const cancelled = orders.filter(order => order.status === 'cancelled');
            const pending = orders.filter(order => order.status !== 'finished' && order.status !== 'cancelled');
            patchState(store, {
              orders: pending.concat(finished, cancelled),
              pendingOrders: pending,
              finishedOrders: finished,
              cancelledOrders: cancelled
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
      addOrder(newOrder: OrderRequest): Observable<Order> {
        return postOrder(newOrder).pipe(tap(() => this.getAll().subscribe()));
      },

      /** Moves requests to other agents and keeps the history of who had them and why. */
      reassign(moves: { orderId: number; to: string; reason: AssignmentReason }[]): void {
        if (moves.length === 0) return;
        const at = new Date().toISOString();
        forkJoin(moves.map(move => {
          const history = store.orders()?.find(order => order.id === move.orderId)?.assignments ?? [];
          return http.patch<Order>(`${url}/${move.orderId}`, {
            agent: move.to,
            assignedAt: at,
            assignments: [...history, { agent: move.to, at, reason: move.reason }]
          });
        })).subscribe(() => this.getAll().subscribe());
      },

      /** Updates the `status` of the order with the given id, stamping `respondedAt` when the agent answers it. */
      updateStatusByOrderID(id: string | number, status: string): void {
        const changes = status === 'finished' ? { status, respondedAt: new Date().toISOString() } : { status };
        http.patch<Order>(`${url}/${id}`, changes).subscribe(() => this.getAll().subscribe());
      },

      // since mock json server can't delete by the following url (as far as I know):
      // localhost:3000/orders?orderID=[number]
      // I need to run over all the orders and delete those that match the correct orderID
      // need to find a better way

      /** Deletes every order record matching the given business `orderID` (not the entity `id`). */
      deleteByOrderID(orderID: string | number): void {
        this.get().pipe(
          switchMap(orders => forkJoin(
            orders.filter(item => item.orderID === orderID).map(item => http.delete<Order>(`${url}/${item.id}`))
          ))
        ).subscribe(() => this.getAll().subscribe());
      }
    };
  }),
  withHooks({
    onInit(store) {
      store.getAll().subscribe();
    }
  })
);
