import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts logged out, using the local identity provider', () => {
    expect(service.isLoggedIn).toBeFalse();
    expect(service.isLocal).toBe('local');
  });

  it('login marks the session as logged in', done => {
    service.login().subscribe(result => {
      expect(result).toBeTrue();
      expect(service.isLoggedIn).toBeTrue();
      done();
    });
  });

  it('logout marks the session as logged out', () => {
    service.isLoggedIn = true;
    service.logout();
    expect(service.isLoggedIn).toBeFalse();
  });

  describe('setThirdParty', () => {
    it('leaves isLocal unchanged when not switching to a third party', () => {
      service.setThirdParty(false);
      expect(service.isLocal).toBe('local');
    });

    it('sets isLocal to the given provider name', () => {
      service.setThirdParty(true, 'google');
      expect(service.isLocal).toBe('google');
    });

    it('clears isLocal when switching to a third party without a name', () => {
      service.setThirdParty(true);
      expect(service.isLocal).toBe('');
    });
  });
});
