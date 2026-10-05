import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { MyFlightsService } from 'projects/my-flights/src';
import { HotelsService } from 'projects/my-hotels/src/lib/my-hotels/hotels.service';
import { Flights } from 'src/interfaces/flight.interface';
import { Hotel } from 'src/interfaces/hotel.interface';
import { Order } from 'src/interfaces/order.interface';
import { environment } from 'src/environments/environment';
import { OrderService } from '../order/order.service';

export interface FinalOrderState {
  order: Order | undefined;
  flight: Flights | undefined;
  hotel: Hotel | undefined;
}

const initialState: FinalOrderState = {
  order: undefined,
  flight: undefined,
  hotel: undefined
};

export const FinalOrderStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const http = inject(HttpClient);
    const orderService = inject(OrderService);
    const flightService = inject(MyFlightsService);
    const hotelService = inject(HotelsService);
    const finalUrl = environment.api + 'finalOrder';

    const postFinalOrder = (request: FinalOrderState) => http.post(finalUrl, request).pipe();

    return {
      update(partial: Partial<FinalOrderState>) {
        patchState(store, partial);
      },

      /**
       * Persists a completed order (order + flight and/or hotel) as a final
       * order, then deletes the pending order/flight/hotel records it was
       * assembled from so they no longer appear as in-progress.
       */
      addFinalOrder(request: FinalOrderState): void {
        try {
          const orderID = request.order?.orderID;
          try {
            orderID ? orderService.deleteByOrderID(orderID) : '';
          } catch (error) {
            console.log('final order -> order service', error);
          }
          try {
            orderID ? hotelService.deleteHotel(orderID) : '';
          } catch (error) {
            console.log('final order -> my flights service', error);
          }
          try {
            orderID ? flightService.deleteFlightsByOrderID(orderID) : '';
          } catch (error) {
            console.log('final order -> hotels service', error);
          }
          postFinalOrder(request).subscribe(data => console.log(data));
        } catch (error) {
          console.log(error);
          console.log('newRequest: ', request, 'type: ', typeof request);
        }
      }
    };
  })
);
