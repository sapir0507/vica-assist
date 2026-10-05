import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

export type UserRole = 'agent' | 'customer';

const experationDate = new Date().getDate() + 30;

export interface SessionState {
  username: string;
  password: string;
  role: UserRole;
  isLoggedIn: boolean;
  isLoading: boolean;
  experationDate: number;
}

const initialState: SessionState = {
  username: '',
  password: '',
  role: 'customer',
  isLoggedIn: false,
  isLoading: false,
  experationDate
};

interface LoginResponseUser {
  username?: string;
  role?: UserRole;
}

export const SessionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const http = inject(HttpClient);

    const siteLogin = (username: string, password: string): Observable<LoginResponseUser[]> => {
      const params = new HttpParams().append('username', username).append('password', password);
      patchState(store, { isLoading: true });
      return http.get<LoginResponseUser[]>(environment.api + 'login', { params }).pipe(
        tap(users => {
          patchState(store, { isLoading: false });
          if (users && users[0]) {
            // Deliberately not patching `password` here -- a normal login should not
            // mirror the backend's plaintext password into client state.
            patchState(store, {
              username: users[0].username ?? username,
              role: users[0].role ?? 'customer',
              isLoggedIn: true,
              experationDate
            });
          }
        }),
        catchError(() => {
          patchState(store, { isLoading: false });
          return of([]);
        })
      );
    };

    return {
      login(username?: string, password?: string, thirdparty?: string) {
        if (thirdparty) {
          switch (thirdparty) {
            case 'TWITTER':
              return null;
            case 'FACEBOOK':
              return null;
            default:
              return username && password ? siteLogin(username, password) : null;
          }
        }
        return username && password ? siteLogin(username, password) : null;
      },
      siteLogin,
      updateUsername(newName: string) {
        patchState(store, { username: newName });
      },
      updatePassword(newPass: string) {
        patchState(store, { password: newPass });
      },
      updateRole(newRole: UserRole) {
        patchState(store, { role: newRole });
      },
      logout() {
        patchState(store, { isLoggedIn: false });
      }
    };
  })
);
