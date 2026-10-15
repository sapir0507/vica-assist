import { HttpClient } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { catchError, firstValueFrom, of } from 'rxjs';
import { Destination } from '@vica-assist/shared';
import { environment } from 'src/environments/environment';

export interface DestinationState {
  destinations: Destination[];
}

const initialState: DestinationState = {
  destinations: []
};

/** The places a trip can go to. Loaded once at startup, so pages can read it without waiting. */
export const DestinationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(store => ({
    active: computed(() => store.destinations().filter(destination => destination.active))
  })),
  withMethods(store => {
    const http = inject(HttpClient);

    return {
      /** Never fails: without the list the app still starts, with nothing to book. */
      async load(): Promise<void> {
        const destinations = await firstValueFrom(
          http.get<Destination[]>(environment.api + 'destinations').pipe(catchError(() => of([] as Destination[])))
        );
        patchState(store, { destinations });
      },

      byId(id: string | null | undefined): Destination | undefined {
        return id ? store.destinations().find(destination => destination.id === id) : undefined;
      },

      /** A destination that can still be booked. */
      bookable(id: string | null | undefined): Destination | undefined {
        const destination = id ? store.destinations().find(item => item.id === id) : undefined;
        return destination?.active ? destination : undefined;
      }
    };
  })
);
