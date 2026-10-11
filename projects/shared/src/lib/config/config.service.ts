import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, firstValueFrom, of, switchMap, tap, throwError, timeout } from 'rxjs';

import { API_URL } from '../api-url.token';
import { validateConfig } from '../order-matching/validate-config';
import { TRIP_CONFIG_DEFAULTS, TripConfig } from './trip.config';

const LOAD_TIMEOUT_MS = 2000;
const SETTINGS_ID = 1;

type StoredConfig = TripConfig & { id: number; updatedAt: string; updatedBy: string };

export class ConfigInvalidError extends Error {
  constructor(readonly errors: string[]) {
    super(errors.join(' '));
  }
}

/**
 * The effective configuration: the defaults shipped in `trip-config.json`, replaced by the document the admin
 * saved in the `settings` collection. A missing, slow or invalid document never blocks the app; it falls back.
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private http = inject(HttpClient);
  private url = inject(API_URL) + 'settings';

  private effective = signal<TripConfig>(TRIP_CONFIG_DEFAULTS);
  private customised = signal(false);

  readonly config = this.effective.asReadonly();
  readonly isCustomised = this.customised.asReadonly();

  load(): Promise<void> {
    return firstValueFrom(
      this.http.get<StoredConfig>(`${this.url}/${SETTINGS_ID}`).pipe(
        timeout(LOAD_TIMEOUT_MS),
        tap(stored => this.use(stored)),
        catchError(error => {
          if (error?.status !== 404) console.error('Using the default configuration:', error);
          return of(null);
        })
      ),
      { defaultValue: null }
    ).then(() => undefined);
  }

  save(config: TripConfig, actor: string): Observable<TripConfig> {
    const errors = validateConfig(config);
    if (errors.length > 0) return throwError(() => new ConfigInvalidError(errors));

    const stored: StoredConfig = {
      ...config,
      id: SETTINGS_ID,
      version: this.effective().version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: actor
    };
    return this.http.put<StoredConfig>(`${this.url}/${SETTINGS_ID}`, stored).pipe(
      catchError(error => (error?.status === 404 ? this.http.post<StoredConfig>(this.url, stored) : throwError(() => error))),
      tap(saved => this.use(saved)),
      switchMap(() => of(this.effective()))
    );
  }

  reset(): Observable<TripConfig> {
    return this.http.delete(`${this.url}/${SETTINGS_ID}`).pipe(
      catchError(error => (error?.status === 404 ? of(null) : throwError(() => error))),
      tap(() => {
        this.effective.set(TRIP_CONFIG_DEFAULTS);
        this.customised.set(false);
      }),
      switchMap(() => of(this.effective()))
    );
  }

  private use(stored: StoredConfig): void {
    const defaults = TRIP_CONFIG_DEFAULTS as unknown as Record<string, unknown>;
    const saved = stored as unknown as Record<string, unknown>;
    const merged = Object.fromEntries(Object.keys(defaults).map(key => [key, saved[key] ?? defaults[key]])) as unknown as TripConfig;

    let errors: string[];
    try {
      errors = validateConfig(merged);
    } catch {
      errors = ['The saved configuration is unreadable.'];
    }
    if (errors.length > 0) {
      console.error('Ignoring the saved configuration:', errors);
      return;
    }
    this.effective.set(merged);
    this.customised.set(true);
  }
}
