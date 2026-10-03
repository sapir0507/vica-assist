import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { SessionService } from './session.service';
import { SessionStore } from './session.store';

describe('SessionService', () => {
  let service: SessionService;
  let httpMock: HttpTestingController;
  let store: SessionStore;

  const url = environment.api + 'login';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SessionService);
    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(SessionStore);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('returns null when neither credentials nor a known third party are given', () => {
      expect(service.login()).toBeNull();
    });

    it('returns null for unimplemented third-party providers', () => {
      expect(service.login('user', 'pass', 'GOOGLE')).toBeNull();
      expect(service.login('user', 'pass', 'TWITTER')).toBeNull();
      expect(service.login('user', 'pass', 'FACEBOOK')).toBeNull();
    });

    it('delegates to siteLogin when username and password are given', () => {
      service.login('user', 'pass');

      const req = httpMock.expectOne(r => r.url === url);
      expect(req.request.params.get('username')).toBe('user');
      expect(req.request.params.get('password')).toBe('pass');
      req.flush([]);
    });
  });

  describe('siteLogin', () => {
    it('updates the store with the returned user on success', () => {
      service.siteLogin('user', 'pass');

      const req = httpMock.expectOne(r => r.url === url);
      req.flush([{ username: 'user', password: 'pass', role: 'customer' }]);

      const state = store.getValue();
      expect(state.username).toBe('user');
      expect(state.role).toBe('customer');
      expect(state.isLoggedIn).toBeTrue();
    });

    it('leaves the store untouched when no user is found', () => {
      service.siteLogin('user', 'wrong');

      const req = httpMock.expectOne(r => r.url === url);
      req.flush([]);

      expect(store.getValue().isLoggedIn).toBeFalse();
    });
  });

  describe('field updates', () => {
    it('updateUsername updates the store', () => {
      service.updateUsername('new-name');
      expect(store.getValue().username).toBe('new-name');
    });

    it('updatePassword updates the store', () => {
      service.updatePassword('new-pass');
      expect(store.getValue().password).toBe('new-pass');
    });

    it('updateRole updates the store', () => {
      service.updateRole('agent');
      expect(store.getValue().role).toBe('agent');
    });
  });
});
