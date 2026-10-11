import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';

import { API_URL } from '../api-url.token';
import { ConfigInvalidError, ConfigService } from './config.service';
import { TRIP_CONFIG_DEFAULTS, TripConfig } from './trip.config';

const url = 'http://localhost:3000/settings/1';

describe('ConfigService', () => {
  let service: ConfigService;
  let httpMock: HttpTestingController;
  let consoleError: ReturnType<typeof vi.spyOn>;

  const changed = (): TripConfig => ({
    ...structuredClone(TRIP_CONFIG_DEFAULTS),
    assignment: { loadWeight: 2, specialtyWeight: 1, responseHours: 12 }
  });

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), { provide: API_URL, useValue: 'http://localhost:3000/' }]
    });
    service = TestBed.inject(ConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    consoleError.mockRestore();
  });

  it('starts with the defaults that ship with the app', () => {
    expect(service.config()).toEqual(TRIP_CONFIG_DEFAULTS);
    expect(service.isCustomised()).toBe(false);
  });

  describe('load', () => {
    it('uses what the admin saved, merged over the defaults', async () => {
      const loading = service.load();
      const { airlines: _unused, ...partial } = { ...changed(), id: 1, updatedAt: 'now', updatedBy: 'admin' };
      httpMock.expectOne(url).flush(partial);
      await loading;

      expect(service.config().assignment.responseHours).toBe(12);
      expect(service.config().airlines).toEqual(TRIP_CONFIG_DEFAULTS.airlines);
      expect(service.isCustomised()).toBe(true);
      expect(service.config()).not.toHaveProperty('updatedBy');
    });

    it('keeps the defaults quietly when nothing was saved yet', async () => {
      const loading = service.load();
      httpMock.expectOne(url).flush('missing', { status: 404, statusText: 'Not Found' });
      await loading;

      expect(service.config()).toEqual(TRIP_CONFIG_DEFAULTS);
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('keeps the defaults and says so when the backend fails', async () => {
      const loading = service.load();
      httpMock.expectOne(url).flush('boom', { status: 500, statusText: 'Server Error' });
      await loading;

      expect(service.config()).toEqual(TRIP_CONFIG_DEFAULTS);
      expect(consoleError).toHaveBeenCalled();
    });

    it('ignores a saved document that fails validation', async () => {
      const loading = service.load();
      const bad = { ...changed(), assignment: { loadWeight: 0, specialtyWeight: 0, responseHours: 12 } };
      httpMock.expectOne(url).flush(bad);
      await loading;

      expect(service.config()).toEqual(TRIP_CONFIG_DEFAULTS);
      expect(service.isCustomised()).toBe(false);
    });

    it('ignores a saved document that is not even the right shape', async () => {
      const loading = service.load();
      httpMock.expectOne(url).flush({ airlines: 'none', cabins: 7 });
      await loading;

      expect(service.config()).toEqual(TRIP_CONFIG_DEFAULTS);
    });
  });

  describe('save', () => {
    it('stores a valid configuration with who saved it, a new version and the time', () => {
      let result: TripConfig | undefined;
      service.save(changed(), 'admin').subscribe(saved => (result = saved));

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toMatchObject({ id: 1, updatedBy: 'admin', version: TRIP_CONFIG_DEFAULTS.version + 1 });
      expect(Number.isNaN(Date.parse(req.request.body.updatedAt))).toBe(false);
      req.flush(req.request.body);

      expect(result?.assignment.responseHours).toBe(12);
      expect(service.config().assignment.responseHours).toBe(12);
      expect(service.isCustomised()).toBe(true);
    });

    it('creates the document the first time', () => {
      service.save(changed(), 'admin').subscribe();

      httpMock.expectOne(url).flush('missing', { status: 404, statusText: 'Not Found' });
      const post = httpMock.expectOne('http://localhost:3000/settings');
      expect(post.request.method).toBe('POST');
      post.flush(post.request.body);

      expect(service.isCustomised()).toBe(true);
    });

    it('refuses an invalid configuration without calling the backend', () => {
      const invalid = changed();
      invalid.assignment.responseHours = 0;
      let error: unknown;

      service.save(invalid, 'admin').subscribe({ error: e => (error = e) });

      expect(error).toBeInstanceOf(ConfigInvalidError);
      expect((error as ConfigInvalidError).errors).toContain('The response promise must be 1 to 168 hours.');
      expect(service.isCustomised()).toBe(false);
    });
  });

  describe('reset', () => {
    it('removes the saved document and goes back to the defaults', () => {
      service.save(changed(), 'admin').subscribe();
      const put = httpMock.expectOne(url);
      put.flush(put.request.body);

      service.reset().subscribe();
      const del = httpMock.expectOne(url);
      expect(del.request.method).toBe('DELETE');
      del.flush({});

      expect(service.config()).toEqual(TRIP_CONFIG_DEFAULTS);
      expect(service.isCustomised()).toBe(false);
    });

    it('is fine when nothing was saved', () => {
      service.reset().subscribe();

      httpMock.expectOne(url).flush('missing', { status: 404, statusText: 'Not Found' });

      expect(service.isCustomised()).toBe(false);
    });
  });
});
