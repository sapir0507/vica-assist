import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { finalOrder, Order } from '@vica-assist/shared';
import { environment } from 'src/environments/environment';
import { PublicSummaryStore } from '../public-summary/public-summary.store';
import { SessionStore } from '../session/session.store';
import { BookingStore } from './booking.store';

const url = environment.api + 'finalOrder';

const booking = (id: number, overrides: Partial<Order> = {}): finalOrder => ({
  id,
  order: {
    id,
    orderID: `o-${id}`,
    choice: 'both',
    status: 'finished',
    departureDate: '2020-06-09',
    returnDate: '2020-06-16',
    origin: 'Israel',
    destination: 'Italy', destinationId: 'paris',
    passDetails: [],
    priceRange: 500,
    customer: 'dana',
    ...overrides
  }
});

const refresh = vi.fn();

describe('BookingStore', () => {
  let store: InstanceType<typeof BookingStore>;
  let httpMock: HttpTestingController;

  const load = (...bookings: finalOrder[]) => {
    store.load();
    httpMock.expectOne(url).flush(bookings);
  };
  const failure = (observable: ReturnType<typeof store.rate>) => {
    let message = '';
    observable.subscribe({ error: (e: Error) => (message = e.message) });
    return message;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), { provide: PublicSummaryStore, useValue: { refresh } }] });
    refresh.mockClear();
    patchState(unprotected(TestBed.inject(SessionStore)), { username: 'dana' });
    store = TestBed.inject(BookingStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads every booking and keeps only the signed-in customer\'s as "mine"', () => {
    load(booking(1), booking(2, { customer: 'noa' }), { id: 3 });

    expect(store.bookings()).toHaveLength(3);
    expect(store.mine().map(b => b.id)).toEqual([1]);
  });

  describe('rate', () => {
    it('patches the feedback of a finished trip and updates the store', () => {
      load(booking(1));

      let result: finalOrder | undefined;
      store.rate(1, { hotelRating: 5, flightRating: 4, review: ' Great ' }).subscribe(updated => (result = updated));

      const req = httpMock.expectOne(`${url}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body.feedback).toMatchObject({ hotelRating: 5, flightRating: 4, review: 'Great' });
      const saved = { ...booking(1), feedback: req.request.body.feedback };
      req.flush(saved);

      expect(result).toEqual(saved);
      expect(store.bookings()?.[0].feedback?.hotelRating).toBe(5);
      expect(refresh).toHaveBeenCalledTimes(1);
    });

    it('refuses someone else\'s booking and an unknown one without calling the backend', () => {
      load(booking(1, { customer: 'noa' }));

      expect(failure(store.rate(1, { hotelRating: 5, flightRating: 5 }))).toContain('not yours');
      expect(failure(store.rate(99, { hotelRating: 5, flightRating: 5 }))).toContain('not yours');
    });

    it('refuses a trip that has not ended', () => {
      load(booking(1, { returnDate: '2999-01-01' }));

      expect(failure(store.rate(1, { hotelRating: 5, flightRating: 5 }))).toContain('after it has ended');
    });

    it('refuses missing or invalid ratings and long reviews', () => {
      load(booking(1));

      expect(failure(store.rate(1, { hotelRating: 5 }))).toContain('1 to 5 stars');
      expect(failure(store.rate(1, { hotelRating: 6, flightRating: 5 }))).toContain('1 to 5 stars');
      expect(failure(store.rate(1, { hotelRating: 5, flightRating: 5, review: 'a'.repeat(501) }))).toContain('1 to 5 stars');
    });

    it('only sends the parts that were booked', () => {
      load(booking(1, { choice: 'flight' }));

      store.rate(1, { hotelRating: 1, flightRating: 3 }).subscribe();

      const req = httpMock.expectOne(`${url}/1`);
      expect(Object.keys(req.request.body.feedback).sort()).toEqual(['flightRating', 'ratedAt']);
      req.flush(booking(1));
    });
  });

  describe('setReviewHidden', () => {
    it('hides and shows a review, keeping what the customer wrote', () => {
      load({ ...booking(1), feedback: { hotelRating: 5, review: 'Lovely', ratedAt: 'x' } });

      store.setReviewHidden(1, true).subscribe();

      const req = httpMock.expectOne(`${url}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body.feedback).toEqual({ hotelRating: 5, review: 'Lovely', ratedAt: 'x', hidden: true });
      req.flush({ ...booking(1), feedback: req.request.body.feedback });
      expect(store.bookings()?.[0].feedback?.hidden).toBe(true);
    });

    it('refuses a booking without a review', () => {
      load(booking(1));
      let message = '';

      store.setReviewHidden(1, true).subscribe({ error: (e: Error) => (message = e.message) });

      expect(message).toBe('This booking has no review.');
    });
  });
});
