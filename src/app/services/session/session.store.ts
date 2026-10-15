import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

export type UserRole = 'admin' | 'agent' | 'customer' | 'unknown';

const SESSION_KEY = 'vica-session';
const REMEMBER_DAYS = 30;
const ROLES: readonly UserRole[] = ['admin', 'agent', 'customer', 'unknown'];

interface StoredSession {
  username: string;
  role: UserRole;
  /** Epoch milliseconds; null for a session that only lasts until the tab is closed. */
  expiresAt: number | null;
}

// Storage can throw (blocked cookies, private windows), and the app must work without it.
function readStoredSession(storage: Storage): StoredSession | null {
  try {
    const stored = JSON.parse(storage.getItem(SESSION_KEY) ?? 'null');
    const valid = typeof stored?.username === 'string' && ROLES.includes(stored.role)
      && (stored.expiresAt === null || typeof stored.expiresAt === 'number');
    if (valid && (stored.expiresAt === null || stored.expiresAt > Date.now())) return stored;
    if (stored) storage.removeItem(SESSION_KEY);
  } catch { /* unreadable or blocked: treated as no saved session */ }
  return null;
}

function writeStoredSession(storage: Storage, session: StoredSession): void {
  try { storage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* the login still works, it just is not kept */ }
}

function clearStoredSessions(): void {
  for (const storage of [localStorage, sessionStorage]) {
    try { storage.removeItem(SESSION_KEY); } catch { /* nothing to clear */ }
  }
}

export interface SessionState {
  username: string;
  password: string;
  role: UserRole;
  isLoggedIn: boolean;
  isLoading: boolean;
  expiresAt: number | null;
}

const initialState: SessionState = {
  username: '',
  password: '',
  role: 'unknown',
  isLoggedIn: false,
  isLoading: false,
  expiresAt: null
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

    const siteLogin = (username: string, password: string, remember = false): Observable<LoginResponseUser[]> => {
      const params = new HttpParams().append('username', username).append('password', password);
      patchState(store, { isLoading: true });
      return http.get<LoginResponseUser[]>(environment.api + 'login', { params }).pipe(
        tap(users => {
          patchState(store, { isLoading: false });
          if (users && users[0]) {
            // Deliberately not patching `password` here -- a normal login should not
            // mirror the backend's plaintext password into client state.
            const session: StoredSession = {
              username: users[0].username ?? username,
              role: users[0].role ?? 'unknown',
              expiresAt: remember ? Date.now() + REMEMBER_DAYS * 24 * 60 * 60 * 1000 : null
            };
            patchState(store, { ...session, isLoggedIn: true });
            clearStoredSessions();
            writeStoredSession(remember ? localStorage : sessionStorage, session);
          }
          else patchState(store, {...initialState});
        }),
        catchError(() => {
          patchState(store, { isLoading: false });
          return of([]);
        })
      );
    };

    return {
      login(username?: string, password?: string, thirdparty?: string, remember = false) {
        if (thirdparty) {
          switch (thirdparty) {
            case 'TWITTER':
              return null;
            case 'FACEBOOK':
              return null;
            default:
              return username && password ? siteLogin(username, password, remember) : null;
          }
        }
        return username && password ? siteLogin(username, password, remember) : null;
      },
      /** Brings back a login saved by "Remember me" (or earlier in this tab); false when there is none or it ran out. */
      restore(): boolean {
        const saved = readStoredSession(localStorage) ?? readStoredSession(sessionStorage);
        if (!saved) return false;
        patchState(store, { ...saved, isLoggedIn: true });
        return true;
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
        clearStoredSessions();
        patchState(store, { ...initialState });
      }
    };
  })
);
