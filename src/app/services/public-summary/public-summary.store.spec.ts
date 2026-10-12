import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { PublicSummary } from '@vica-assist/shared';
import { environment } from 'src/environments/environment';
import { PublicSummaryStore } from './public-summary.store';

const api = environment.api;
const summary: PublicSummary = {
  id: 1, updatedAt: 'x', bookings: 0, sufficient: false, averageRating: null, pleasedPercent: null, averageResponseHours: null, topDestinations: [], reviews: [], agents: [], airlines: []
};

describe('PublicSummaryStore', () => {
  let store: InstanceType<typeof PublicSummaryStore>;
  let httpMock: HttpTestingController;
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({ providers: [provideHttpClient(withXhr()), provideHttpClientTesting()] });
    store = TestBed.inject(PublicSummaryStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    consoleError.mockRestore();
  });

  it('is still loading until the summary arrives', () => {
    expect(store.summary()).toBeUndefined();
  });

  it('loads the published summary', () => {
    store.load();
    httpMock.expectOne(`${api}publicSummary/1`).flush(summary);

    expect(store.summary()).toEqual(summary);
  });

  it('says nothing has been published when there is no summary yet', () => {
    store.load();
    httpMock.expectOne(`${api}publicSummary/1`).flush('missing', { status: 404, statusText: 'Not Found' });

    expect(store.summary()).toBeNull();
  });

  it('rebuilds the summary from the bookings and agents and publishes it', () => {
    store.refresh();
    httpMock.expectOne(`${api}finalOrder`).flush([]);
    httpMock.expectOne(`${api}agents`).flush([{ id: 1, username: 'dana', displayName: 'Dana Levi', title: 'Agent', bio: 'private', languages: ['Hebrew'], specialties: [], yearsExperience: 1, email: 'private@example.com', available: true, active: true }]);

    const put = httpMock.expectOne(`${api}publicSummary/1`);
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toMatchObject({ id: 1, bookings: 0, sufficient: false });
    expect(put.request.body.agents[0].name).toBe('Dana Levi');
    expect(JSON.stringify(put.request.body)).not.toContain('private');
    put.flush(put.request.body);

    expect(store.summary()?.bookings).toBe(0);
  });

  it('creates the document the first time', () => {
    store.refresh();
    httpMock.expectOne(`${api}finalOrder`).flush([]);
    httpMock.expectOne(`${api}agents`).flush([]);

    httpMock.expectOne(`${api}publicSummary/1`).flush('missing', { status: 404, statusText: 'Not Found' });
    const post = httpMock.expectOne(`${api}publicSummary`);
    expect(post.request.method).toBe('POST');
    post.flush(post.request.body);

    expect(store.summary()).not.toBeNull();
  });

  it('reports a failure without breaking the page that asked', () => {
    store.refresh();
    httpMock.expectOne(`${api}finalOrder`).flush('boom', { status: 500, statusText: 'Server Error' });
    httpMock.match(`${api}agents`);

    expect(consoleError).toHaveBeenCalled();
    expect(store.summary()).toBeUndefined();
  });
});
