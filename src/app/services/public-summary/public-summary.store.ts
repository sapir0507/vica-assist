import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { catchError, forkJoin, of, switchMap, throwError } from 'rxjs';
import { Agent, buildPublicSummary, ConfigService, finalOrder, PublicSummary } from '@vica-assist/shared';
import { environment } from 'src/environments/environment';

export interface PublicSummaryState {
  /** `undefined` while loading, `null` when nothing has been published yet. */
  summary: PublicSummary | null | undefined;
}

const initialState: PublicSummaryState = {
  summary: undefined
};

const SUMMARY_ID = 1;

/**
 * Visitors read only this document. It is rebuilt whenever something it is made from changes (a booking, a
 * rating, an agent, an airline, a hidden review); a real system would do this on the server.
 */
export const PublicSummaryStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(store => {
    const http = inject(HttpClient);
    const config = inject(ConfigService);
    const url = environment.api + 'publicSummary';

    return {
      load(): void {
        http.get<PublicSummary>(`${url}/${SUMMARY_ID}`).pipe(catchError(() => of(null))).subscribe(summary => patchState(store, { summary }));
      },

      refresh(): void {
        forkJoin({
          bookings: http.get<finalOrder[]>(environment.api + 'finalOrder'),
          agents: http.get<Agent[]>(environment.api + 'agents')
        }).pipe(
          switchMap(({ bookings, agents }) => {
            const summary = { ...buildPublicSummary(bookings, agents, config.config()), id: SUMMARY_ID };
            return http.put<PublicSummary>(`${url}/${SUMMARY_ID}`, summary).pipe(
              catchError(error => (error?.status === 404 ? http.post<PublicSummary>(url, summary) : throwError(() => error)))
            );
          })
        ).subscribe({
          next: summary => patchState(store, { summary }),
          error: error => console.error('The public summary could not be updated:', error)
        });
      }
    };
  })
);
