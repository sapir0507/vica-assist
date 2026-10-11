import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditEntry } from '@vica-assist/shared';
import { environment } from 'src/environments/environment';

export interface AuditState {
  entries: AuditEntry[] | undefined;
}

const initialState: AuditState = {
  entries: undefined
};

/** Append-only: entries can be read and added, never changed or removed from here. */
export const AuditStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(store => {
    const http = inject(HttpClient);
    const url = environment.api + 'auditLog';

    return {
      load(): void {
        http.get<AuditEntry[]>(url).subscribe(entries => patchState(store, { entries }));
      },

      record(actor: string, action: string, detail: string): Observable<AuditEntry> {
        return http.post<AuditEntry>(url, { at: new Date().toISOString(), actor, action, detail }).pipe(
          tap(entry => patchState(store, { entries: [...(store.entries() ?? []), entry] }))
        );
      }
    };
  })
);
