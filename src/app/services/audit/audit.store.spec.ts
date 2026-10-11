import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuditStore } from './audit.store';

const url = environment.api + 'auditLog';

describe('AuditStore', () => {
  let store: InstanceType<typeof AuditStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withXhr()), provideHttpClientTesting()] });
    store = TestBed.inject(AuditStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the log', () => {
    store.load();
    httpMock.expectOne(url).flush([{ id: 1, at: 'x', actor: 'admin', action: 'a', detail: 'd' }]);

    expect(store.entries()).toHaveLength(1);
  });

  it('adds an entry with the time, who did it and what', () => {
    store.record('admin', 'airline.add', 'added airline Test Air').subscribe();

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toMatchObject({ actor: 'admin', action: 'airline.add', detail: 'added airline Test Air' });
    expect(Number.isNaN(Date.parse(req.request.body.at))).toBe(false);
    req.flush({ ...req.request.body, id: 5 });

    expect(store.entries()?.map(entry => entry.id)).toEqual([5]);
  });

  it('can only read and add: there is no way to change or remove an entry', () => {
    expect(Object.keys(store).filter(key => /update|delete|remove|clear/i.test(key))).toEqual([]);
  });
});
