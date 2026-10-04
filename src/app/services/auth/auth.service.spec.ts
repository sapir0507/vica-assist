import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts using the local identity provider', () => {
    expect(service.isLocal).toBe('local');
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
