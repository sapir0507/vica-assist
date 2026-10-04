import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { SessionStore, UserRole } from '../session/session.store';

describe('authGuard', () => {
  let store: SessionStore;
  let router: jasmine.SpyObj<Router>;
  const dummyTree = {} as UrlTree;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue(dummyTree);

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
    store.update(s => ({ ...s, isLoggedIn: false }));

    expect(run()).toBe(dummyTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('redirects to /login when not logged in, even if the route requires a role', () => {
    store.update(s => ({ ...s, isLoggedIn: false }));

    expect(run('agent')).toBe(dummyTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('allows access when logged in and no role is required', () => {
    store.update(s => ({ ...s, isLoggedIn: true }));

    expect(run()).toBeTruthy();
  });

  it('redirects to /homepage when logged in but the role does not match', () => {
    store.update(s => ({ ...s, isLoggedIn: true, role: 'customer' }));

    expect(run('agent')).toBe(dummyTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/homepage']);
  });

  it('allows access when logged in and the role matches', () => {
    store.update(s => ({ ...s, isLoggedIn: true, role: 'agent' }));

    expect(run('agent')).toBeTruthy();
  });
});
