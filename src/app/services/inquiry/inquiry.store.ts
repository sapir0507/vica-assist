import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Inquiry, InquiryStatus } from '@vica-assist/shared';
import { environment } from 'src/environments/environment';

export interface InquiryState {
  inquiries: Inquiry[] | undefined;
}

const initialState: InquiryState = {
  inquiries: undefined
};

export const InquiryStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(store => {
    const http = inject(HttpClient);
    const url = environment.api + 'inquiries';

    return {
      load(): void {
        http.get<Inquiry[]>(url).subscribe(inquiries => patchState(store, { inquiries }));
      },

      /** What a visitor sends; the page checks it first, and the status always starts as new. */
      submit(input: Pick<Inquiry, 'name' | 'email' | 'message'>): Observable<Inquiry> {
        return http.post<Inquiry>(url, { ...input, createdAt: new Date().toISOString(), status: 'new' });
      },

      setStatus(id: number, status: InquiryStatus): Observable<Inquiry> {
        return http.patch<Inquiry>(`${url}/${id}`, { status }).pipe(
          tap(updated => patchState(store, { inquiries: store.inquiries()?.map(item => (item.id === updated.id ? updated : item)) }))
        );
      }
    };
  })
);
