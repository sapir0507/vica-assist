import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { InvalidResetLinkError, PasswordResetService } from './password-reset.service';

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let httpMock: HttpTestingController;

  const usersUrl = environment.api + 'login';
  const resetsUrl = environment.api + 'passwordResets';

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withXhr()), provideHttpClientTesting()] });
    service = TestBed.inject(PasswordResetService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('request', () => {
    it('stores a token that lasts about 30 minutes and hands it back', () => {
      let token = '';
      service.request('sapir').subscribe(value => (token = value));

      httpMock.expectOne(r => r.url === usersUrl && r.params.get('username') === 'sapir').flush([{ id: 7 }]);
      httpMock.expectOne(r => r.method === 'GET' && r.url === resetsUrl && r.params.get('userId') === '7').flush([]);
      const post = httpMock.expectOne(r => r.method === 'POST' && r.url === resetsUrl);
      post.flush({});

      expect(post.request.body.userId).toBe(7);
      expect(post.request.body.token).toBe(token);
      const minutes = (Date.parse(post.request.body.expiresAt) - Date.now()) / 60_000;
      expect(minutes).toBeGreaterThan(29);
      expect(minutes).toBeLessThanOrEqual(30);
    });

    it('replaces an older token for the same account', () => {
      service.request('sapir').subscribe();

      httpMock.expectOne(r => r.url === usersUrl).flush([{ id: 7 }]);
      httpMock.expectOne(r => r.method === 'GET' && r.url === resetsUrl).flush([{ id: 3 }]);
      httpMock.expectOne(r => r.method === 'DELETE' && r.url === `${resetsUrl}/3`).flush({});
      httpMock.expectOne(r => r.method === 'POST' && r.url === resetsUrl).flush({});
    });

    it('answers the same way for an unknown username, without storing anything', () => {
      let token = '';
      service.request('nobody').subscribe(value => (token = value));

      httpMock.expectOne(r => r.url === usersUrl).flush([]);

      expect(token).not.toBe('');
      httpMock.expectNone(resetsUrl);
    });
  });

  describe('reset', () => {
    const future = () => new Date(Date.now() + 60_000).toISOString();

    it('sets the new password and uses up the token', () => {
      let done = false;
      service.reset('abc', 'new-pass').subscribe(() => (done = true));

      httpMock.expectOne(r => r.url === resetsUrl && r.params.get('token') === 'abc').flush([{ id: 3, userId: 7, token: 'abc', expiresAt: future() }]);
      const patch = httpMock.expectOne(r => r.method === 'PATCH' && r.url === `${usersUrl}/7`);
      patch.flush({});
      httpMock.expectOne(r => r.method === 'DELETE' && r.url === `${resetsUrl}/3`).flush({});

      expect(patch.request.body).toEqual({ password: 'new-pass' });
      expect(done).toBe(true);
    });

    it('rejects an unknown token and an expired one without changing any password', () => {
      const errors: unknown[] = [];
      service.reset('nope', 'new-pass').subscribe({ error: error => errors.push(error) });
      httpMock.expectOne(resetsUrl + '?token=nope').flush([]);

      service.reset('old', 'new-pass').subscribe({ error: error => errors.push(error) });
      httpMock.expectOne(resetsUrl + '?token=old').flush([{ id: 4, userId: 7, token: 'old', expiresAt: new Date(Date.now() - 1).toISOString() }]);

      expect(errors.length).toBe(2);
      expect(errors.every(error => error instanceof InvalidResetLinkError)).toBe(true);
      httpMock.expectNone(r => r.method === 'PATCH');
    });
  });
});
