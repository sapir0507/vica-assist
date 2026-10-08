import type { Mock } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { authGuard } from './auth.guard';
import { SessionStore, UserRole } from 'src/app/services/session/session.store';

describe('authGuard', () => {
  let store: InstanceType<typeof SessionStore>;
  let router: { createUrlTree: Mock };
  const dummyTree = {} as UrlTree;

  beforeEach(() => {
    router = { createUrlTree: vi.fn().mockReturnValue(dummyTree) };

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: router }]
    });

    store = TestBed.inject(SessionStore);
  });

  function run(expectedRole?: UserRole) {
    const route = { data: expectedRole ? { expectedRole } : {} } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    return TestBed.runInInjectionContext(() => authGuard(route, state));
  }

  it('redirects to /login when not logged in', () => {
    patchState(unprotected(store), { isLoggedIn: false });

    expect(run()).toBe(dummyTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('redirects to /login when not logged in, even if the route requires a role', () => {
    patchState(unprotected(store), { isLoggedIn: false });

    expect(run('agent')).toBe(dummyTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('allows access when logged in and no role is required', () => {
    patchState(unprotected(store), { isLoggedIn: true });

    expect(run()).toBeTruthy();
  });

  it('redirects to /homepage when logged in but the role does not match', () => {
    patchState(unprotected(store), { isLoggedIn: true, role: 'customer' });

    expect(run('agent')).toBe(dummyTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/homepage']);
  });

  it('allows access when logged in and the role matches', () => {
    patchState(unprotected(store), { isLoggedIn: true, role: 'agent' });

    expect(run('agent')).toBeTruthy();
  });
});
