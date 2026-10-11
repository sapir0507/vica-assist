import { HttpClient } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Agent } from '@vica-assist/shared';
import { environment } from 'src/environments/environment';

export interface AgentState {
  agents: Agent[] | undefined;
}

const initialState: AgentState = {
  agents: undefined
};

export const AgentStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(store => ({
    active: computed(() => (store.agents() ?? []).filter(agent => agent.active))
  })),
  withMethods(store => {
    const http = inject(HttpClient);
    const url = environment.api + 'agents';

    return {
      load(): void {
        http.get<Agent[]>(url).subscribe(agents => patchState(store, { agents }));
      },

      byUsername(username: string): Agent | undefined {
        return store.agents()?.find(agent => agent.username === username);
      },

      setAvailability(username: string, available: boolean): Observable<Agent> {
        const agent = store.agents()?.find(item => item.username === username);
        if (!agent) return throwError(() => new Error('This agent does not exist.'));

        return http.patch<Agent>(`${url}/${agent.id}`, { available }).pipe(
          tap(updated => patchState(store, { agents: store.agents()?.map(item => (item.id === updated.id ? updated : item)) }))
        );
      }
    };
  })
);
