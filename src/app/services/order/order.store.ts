import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { Observable, forkJoin, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Agent, AssignmentReason, AssignmentRules, Order, OrderRequest, OrderStatus, planReassignments } from '@vica-assist/shared';

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
      switchMap(created => http.patch<Order>(`${url}/${created.id}`, { orderID: String(created.id) })),
      catchError(err => handleError(err, 'postOrder', order))
    );

    return {
      /** Replaces the pending/finished buckets with what the backend holds now. */
      getAll() {
        return http.get<Order[]>(url).pipe(
          tap(orders => {
            const finished = orders.filter(order => order.status === OrderStatus.Finished);
            const cancelled = orders.filter(order => order.status === OrderStatus.Cancelled);
            const pending = orders.filter(order => ![OrderStatus.Finished, OrderStatus.Cancelled, OrderStatus.Booked].includes(order.status as OrderStatus));
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

      /**
       * Creates a new order on the backend, then refreshes the local pending/finished buckets. The backend picks the
       * id, so two requests sent at the same moment cannot share a number; `orderID` (the key flights and hotels use)
       * is set from it afterwards.
       */
      addOrder(newOrder: OrderRequest): Observable<Order> {
        return postOrder(newOrder).pipe(tap(() => this.getAll().subscribe()));
      },

      /** Cancels a request that is still waiting for its agent. */
      cancel(id: number): Observable<Order> {
        if (store.orders()?.find(order => order.id === id)?.status !== OrderStatus.Pending) {
          return throwError(() => new Error('Only a request that is still waiting for an agent can be cancelled.'));
        }
        return http.patch<Order>(`${url}/${id}`, { status: OrderStatus.Cancelled, cancelledAt: new Date().toISOString() }).pipe(
          tap(() => this.getAll().subscribe())
        );
      },

      /** Saves the customer's changes to a request that is still waiting for its agent. */
      updatePending(id: number, changes: Partial<OrderRequest>): Observable<Order> {
        if (store.orders()?.find(order => order.id === id)?.status !== OrderStatus.Pending) {
          return throwError(() => new Error('Only a request that is still waiting for an agent can be changed.'));
        }
        return http.patch<Order>(`${url}/${id}`, { ...changes, updatedAt: new Date().toISOString() }).pipe(
          tap(() => this.getAll().subscribe())
        );
      },

      /** Hands over the requests that are overdue or belong to an agent who is away. */
      runReassignments(agents: Agent[], rules: AssignmentRules): void {
        this.reassign(planReassignments(store.orders() ?? [], agents, new Date(), rules));
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
      updateStatusByOrderID(id: string | number, status: OrderStatus): void {
        const changes = status === OrderStatus.Finished ? { status, respondedAt: new Date().toISOString() } : { status };
        http.patch<Order>(`${url}/${id}`, changes).subscribe(() => this.getAll().subscribe());
      }
    };
  }),
  withHooks({
    onInit(store) {
      store.getAll().subscribe();
    }
  })
);
