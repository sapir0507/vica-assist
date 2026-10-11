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

  const run = (role: 'admin' | 'agent' | 'customer') =>
    TestBed.runInInjectionContext(() => roleMatch(role)({} as Route, [], {} as PartialMatchRouteSnapshot));

  it('matches when the session role equals the required role', () => {
    patchState(unprotected(store), { role: 'agent' });

    expect(run('agent')).toBe(true);
  });

  it('does not match when the session role differs', () => {
    patchState(unprotected(store), { role: 'customer' });

    expect(run('agent')).toBe(false);
  });

  it('keeps the admin apart from the agent: each role gets only its own homepage', () => {
    patchState(unprotected(store), { role: 'admin' });
    expect(run('admin')).toBe(true);
    expect(run('agent')).toBe(false);
    expect(run('customer')).toBe(false);

    patchState(unprotected(store), { role: 'agent' });
    expect(run('admin')).toBe(false);
  });
});
