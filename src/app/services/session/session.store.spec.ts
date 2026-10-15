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
    localStorage.clear();
    sessionStorage.clear();
  });

  it('starts logged out with the default role', () => {
    expect(store.isLoggedIn()).toBeFalsy();
    expect(store.role()).toBe('unknown');
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
      expect(store.isLoggedIn()).toBe(true);
      expect(store.password()).toBe('');
    });

    it('toggles isLoading while the request is in flight', () => {
      store.siteLogin('user', 'pass').subscribe();
      expect(store.isLoading()).toBe(true);

      const req = httpMock.expectOne(r => r.url === url);
      req.flush([{ username: 'user', password: 'pass', role: 'customer' }]);

      expect(store.isLoading()).toBe(false);
    });

    it('leaves the store logged out when no user is found', () => {
      store.siteLogin('user', 'wrong').subscribe();

      const req = httpMock.expectOne(r => r.url === url);
      req.flush([]);

      expect(store.isLoggedIn()).toBeFalsy();
      expect(store.role()).toBe('unknown');
      expect(store.username()).toBe('');
    });

    it('does not throw on an HTTP error, and leaves the store logged out', () => {
      store.siteLogin('user', 'pass').subscribe();

      const req = httpMock.expectOne(r => r.url === url);
      req.flush('server error', { status: 500, statusText: 'Internal Server Error' });

      expect(store.isLoggedIn()).toBeFalsy();
      expect(store.isLoading()).toBe(false);
    });
  });

  describe('remember me', () => {
    const logIn = (remember: boolean) => {
      store.siteLogin('user', 'pass', remember).subscribe();
      httpMock.expectOne(r => r.url === url).flush([{ username: 'user', password: 'pass', role: 'agent' }]);
    };
    const saved = (storage: Storage) => JSON.parse(storage.getItem('vica-session') ?? 'null');

    it('keeps the login in localStorage for 30 days when ticked, without the password', () => {
      logIn(true);

      const days = (saved(localStorage).expiresAt - Date.now()) / (24 * 60 * 60 * 1000);
      expect(days).toBeGreaterThan(29.9);
      expect(days).toBeLessThanOrEqual(30);
      expect(saved(localStorage)).toEqual(expect.objectContaining({ username: 'user', role: 'agent' }));
      expect(localStorage.getItem('vica-session')).not.toContain('pass');
      expect(sessionStorage.getItem('vica-session')).toBeNull();
      expect(store.expiresAt()).toBe(saved(localStorage).expiresAt);
    });

    it('keeps it only for the tab when not ticked', () => {
      logIn(false);

      expect(saved(sessionStorage)).toEqual({ username: 'user', role: 'agent', expiresAt: null });
      expect(localStorage.getItem('vica-session')).toBeNull();
    });

    it('restores a saved login after a reload', () => {
      logIn(true);
      store.logout();
      localStorage.setItem('vica-session', JSON.stringify({ username: 'user', role: 'agent', expiresAt: Date.now() + 60_000 }));

      expect(store.restore()).toBe(true);
      expect(store.isLoggedIn()).toBe(true);
      expect(store.role()).toBe('agent');
      expect(store.username()).toBe('user');
    });

    it('restores a login saved for the tab', () => {
      sessionStorage.setItem('vica-session', JSON.stringify({ username: 'user', role: 'customer', expiresAt: null }));

      expect(store.restore()).toBe(true);
      expect(store.role()).toBe('customer');
    });

    it('ignores and removes a login that has run out', () => {
      localStorage.setItem('vica-session', JSON.stringify({ username: 'user', role: 'agent', expiresAt: Date.now() - 1 }));

      expect(store.restore()).toBe(false);
      expect(store.isLoggedIn()).toBe(false);
      expect(localStorage.getItem('vica-session')).toBeNull();
    });

    it('ignores anything that is not a saved login, such as an edited role', () => {
      for (const bad of ['not json', '{"username":"user","role":"superuser","expiresAt":null}', '{"role":"agent"}']) {
        localStorage.setItem('vica-session', bad);
        expect(store.restore()).toBe(false);
      }
      expect(store.isLoggedIn()).toBe(false);
    });

    it('forgets the saved login on logout', () => {
      logIn(true);

      store.logout();

      expect(localStorage.getItem('vica-session')).toBeNull();
      expect(sessionStorage.getItem('vica-session')).toBeNull();
    });
  });

  describe('logout', () => {
    it('resets the session, including the role', () => {
      store.siteLogin('user', 'pass').subscribe();
      httpMock.expectOne(r => r.url === url).flush([{ username: 'user', password: 'pass', role: 'agent' }]);
      expect(store.role()).toBe('agent');

      store.logout();

      expect(store.isLoggedIn()).toBe(false);
      expect(store.role()).toBe('unknown');
      expect(store.username()).toBe('');
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
