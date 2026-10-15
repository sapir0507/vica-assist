import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Destination } from '@vica-assist/shared';

import { environment } from 'src/environments/environment';
import { DestinationStore } from './destination.store';

const place = (id: string, active = true): Destination => ({ id, name: id, emoji: '📍', description: '', fromPrice: 1, gradient: 'none', active });

describe('DestinationStore', () => {
  let store: InstanceType<typeof DestinationStore>;
  let httpMock: HttpTestingController;
  const url = environment.api + 'destinations';

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withXhr()), provideHttpClientTesting()] });
    store = TestBed.inject(DestinationStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('starts empty and fills from the destinations collection', async () => {
    expect(store.destinations()).toEqual([]);

    const loaded = store.load();
    httpMock.expectOne(url).flush([place('paris'), place('rome', false)]);
    await loaded;

    expect(store.destinations().map(d => d.id)).toEqual(['paris', 'rome']);
    expect(store.active().map(d => d.id)).toEqual(['paris']);
  });

  it('starts with nothing to book, rather than failing, when the list cannot be loaded', async () => {
    const loaded = store.load();
    httpMock.expectOne(url).flush('down', { status: 500, statusText: 'Server Error' });
    await loaded;

    expect(store.destinations()).toEqual([]);
  });

  it('finds a destination by id, and tells a bookable one from a retired one', async () => {
    const loaded = store.load();
    httpMock.expectOne(url).flush([place('paris'), place('rome', false)]);
    await loaded;

    expect(store.byId('rome')?.id).toBe('rome');
    expect(store.byId('atlantis')).toBeUndefined();
    expect(store.byId(null)).toBeUndefined();
    expect(store.bookable('paris')?.id).toBe('paris');
    expect(store.bookable('rome')).toBeUndefined();
  });
});
