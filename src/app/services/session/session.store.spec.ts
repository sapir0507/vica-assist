import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SessionStore } from './session.store';

describe('SessionStore', () => {
  let store: InstanceType<typeof SessionStore>;
  let httpMock: HttpTestingController;

  const url = environment.api + 'login';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()]
    });
    store = TestBed.inject(SessionStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('starts logged out with the default role', () => {
    expect(store.isLoggedIn()).toBeFalsy();
    expect(store.role()).toBe('customer');
  });

  describe('login', () => {
    it('returns null when neither credentials nor a known third party are given', () => {
      expect(store.login()).toBeNull();
    });

    it('returns null for unimplemented third-party providers', () => {
      expect(store.login('user', 'pass', 'TWITTER')).toBeNull();
      expect(store.login('user', 'pass', 'FACEBOOK')).toBeNull();
    });

    it('delegates to siteLogin when username and password are given', () => {
      store.login('user', 'pass')?.subscribe();

      const req = httpMock.expectOne(r => r.url === url);
      expect(req.request.params.get('username')).toBe('user');
      expect(req.request.params.get('password')).toBe('pass');
      req.flush([]);
    });
  });

  describe('siteLogin', () => {
    it('updates the store with the returned user on success, without storing the password', () => {
      store.siteLogin('user', 'pass').subscribe();

      const req = httpMock.expectOne(r => r.url === url);
      req.flush([{ username: 'user', password: 'pass', role: 'customer' }]);

      expect(store.username()).toBe('user');
      expect(store.role()).toBe('customer');
      expect(store.isLoggedIn()).toBeTrue();
      expect(store.password()).toBe('');
    });

    it('toggles isLoading while the request is in flight', () => {
      store.siteLogin('user', 'pass').subscribe();
      expect(store.isLoading()).toBeTrue();

      const req = httpMock.expectOne(r => r.url === url);
      req.flush([{ username: 'user', password: 'pass', role: 'customer' }]);

      expect(store.isLoading()).toBeFalse();
    });

    it('leaves the store logged out when no user is found', () => {
      store.siteLogin('user', 'wrong').subscribe();

      const req = httpMock.expectOne(r => r.url === url);
      req.flush([]);

      expect(store.isLoggedIn()).toBeFalsy();
    });

    it('does not throw on an HTTP error, and leaves the store logged out', () => {
      store.siteLogin('user', 'pass').subscribe();

      const req = httpMock.expectOne(r => r.url === url);
      req.flush('server error', { status: 500, statusText: 'Internal Server Error' });

      expect(store.isLoggedIn()).toBeFalsy();
      expect(store.isLoading()).toBeFalse();
    });
  });

  describe('field updates', () => {
    it('updateUsername updates the store', () => {
      store.updateUsername('new-name');
      expect(store.username()).toBe('new-name');
    });

    it('updatePassword updates the store', () => {
      store.updatePassword('new-pass');
      expect(store.password()).toBe('new-pass');
    });

    it('updateRole updates the store', () => {
      store.updateRole('agent');
      expect(store.role()).toBe('agent');
    });

    it('logout clears the logged-in flag', () => {
      store.updateRole('agent');
      store.logout();
      expect(store.isLoggedIn()).toBeFalsy();
    });
  });
});
