import { TestBed } from '@angular/core/testing';
import { PartialMatchRouteSnapshot, Route } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { roleMatch } from './role.match';
import { SessionStore } from 'src/app/services/session/session.store';

describe('roleMatch', () => {
  let store: InstanceType<typeof SessionStore>;

  beforeEach(() => {
    store = TestBed.inject(SessionStore);
  });

  const run = (role: 'agent' | 'customer') =>
    TestBed.runInInjectionContext(() => roleMatch(role)({} as Route, [], {} as PartialMatchRouteSnapshot));

  it('matches when the session role equals the required role', () => {
    patchState(unprotected(store), { role: 'agent' });

    expect(run('agent')).toBeTrue();
  });

  it('does not match when the session role differs', () => {
    patchState(unprotected(store), { role: 'customer' });

    expect(run('agent')).toBeFalse();
  });
});
