import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of, switchMap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

const RESET_MINUTES = 30;

interface PasswordReset {
  id: number;
  userId: number;
  token: string;
  expiresAt: string;
}

export class InvalidResetLinkError extends Error {
  constructor() {
    super('This reset link is not valid or has expired.');
  }
}

/**
 * Reset links for a mock backend that cannot send email: the page shows the message instead. Tokens are
 * single-use and short-lived, and only one is kept per account.
 */
@Injectable({ providedIn: 'root' })
export class PasswordResetService {
  private http = inject(HttpClient);
  private usersUrl = environment.api + 'login';
  private resetsUrl = environment.api + 'passwordResets';

  /** Gives back a token whether or not the account exists, so the page never reveals which usernames are taken. */
  request(username: string): Observable<string> {
    const token = crypto.randomUUID();
    const params = new HttpParams().set('username', username);
    return this.http.get<{ id: number }[]>(this.usersUrl, { params }).pipe(
      switchMap(([user]) => {
        if (!user) return of(token);
        const expiresAt = new Date(Date.now() + RESET_MINUTES * 60 * 1000).toISOString();
        return this.http.get<PasswordReset[]>(this.resetsUrl, { params: new HttpParams().set('userId', user.id) }).pipe(
          switchMap(older => (older.length ? forkJoin(older.map(reset => this.http.delete(`${this.resetsUrl}/${reset.id}`))) : of([]))),
          switchMap(() => this.http.post(this.resetsUrl, { userId: user.id, token, expiresAt })),
          switchMap(() => of(token))
        );
      })
    );
  }

  /** Sets the new password and uses up the token; fails with InvalidResetLinkError for an unknown or expired one. */
  reset(token: string, password: string): Observable<void> {
    return this.http.get<PasswordReset[]>(this.resetsUrl, { params: new HttpParams().set('token', token) }).pipe(
      switchMap(([found]) => {
        if (!found || Date.parse(found.expiresAt) < Date.now()) return throwError(() => new InvalidResetLinkError());
        return this.http.patch(`${this.usersUrl}/${found.userId}`, { password }).pipe(
          switchMap(() => this.http.delete(`${this.resetsUrl}/${found.id}`)),
          switchMap(() => of(undefined))
        );
      })
    );
  }
}
