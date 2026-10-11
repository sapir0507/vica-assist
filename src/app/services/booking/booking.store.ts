import { HttpClient } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { bookedParts, FeedbackInput, finalOrder, hasTripEnded, toFeedback } from '@vica-assist/shared';
import { environment } from 'src/environments/environment';
import { SessionStore } from '../session/session.store';

export interface BookingState {
  bookings: finalOrder[] | undefined;
}

const initialState: BookingState = {
  bookings: undefined
};

export const BookingStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    const session = inject(SessionStore);
    return {
      mine: computed(() => (store.bookings() ?? []).filter(booking => booking.order?.customer === session.username()))
    };
  }),
  withMethods((store) => {
    const http = inject(HttpClient);
    const session = inject(SessionStore);
    const url = environment.api + 'finalOrder';

    return {
      load(): void {
        http.get<finalOrder[]>(url).subscribe(bookings => patchState(store, { bookings }));
      },

      /** Keeps a review off the public page, or puts it back; the rating itself still counts. */
      setReviewHidden(bookingId: number, hidden: boolean): Observable<finalOrder> {
        const booking = store.bookings()?.find(item => item.id === bookingId);
        if (!booking?.feedback) return throwError(() => new Error('This booking has no review.'));
        return http.patch<finalOrder>(`${url}/${bookingId}`, { feedback: { ...booking.feedback, hidden } }).pipe(
          tap(updated => patchState(store, { bookings: store.bookings()?.map(item => (item.id === bookingId ? updated : item)) }))
        );
      },

      /**
       * Stores the signed-in customer's rating of a finished trip. The checks repeat what the form enforces,
       * because the form is not the only way to reach this method.
       */
      rate(bookingId: number, input: FeedbackInput): Observable<finalOrder> {
        const booking = store.bookings()?.find(item => item.id === bookingId);
        if (!booking || booking.order?.customer !== session.username()) {
          return throwError(() => new Error('This booking is not yours to rate.'));
        }
        if (!hasTripEnded(booking.order.returnDate)) {
          return throwError(() => new Error('You can rate a trip after it has ended.'));
        }
        const feedback = toFeedback(bookedParts(booking.order.choice), input);
        if (!feedback) {
          return throwError(() => new Error('Give every part of the trip 1 to 5 stars and keep the review short.'));
        }

        return http.patch<finalOrder>(`${url}/${bookingId}`, { feedback }).pipe(
          tap(updated => patchState(store, {
            bookings: store.bookings()?.map(item => (item.id === bookingId ? updated : item))
          }))
        );
      }
    };
  })
);
