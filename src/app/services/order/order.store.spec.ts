import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Order } from '@vica-assist/shared';
import { OrderStore } from './order.store';

describe('OrderStore', () => {
  let store: InstanceType<typeof OrderStore>;
  let httpMock: HttpTestingController;

  const url = environment.api + 'orders';

  const makeOrder = (overrides: Partial<Order> = {}): Order => ({
    id: 1,
    orderID: 'abc',
    choice: 'flight',
    status: 'pending',
    departureDate: '2024-01-01',
    returnDate: '2024-01-05',
    origin: 'TLV',
    destination: 'JFK',
    passDetails: [],
    priceRange: 100,
    ...overrides
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()]
    });

    store = TestBed.inject(OrderStore);
    httpMock = TestBed.inject(HttpTestingController);

    // onInit calls getAll(); flush it so each test starts clean.
    const req = httpMock.expectOne(url);
    req.flush([]);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('starts empty', () => {
    expect(store.orders()).toEqual([]);
    expect(store.pendingOrders()).toEqual([]);
    expect(store.finishedOrders()).toEqual([]);
  });

  describe('getAll', () => {
    it('splits orders into pending and finished buckets by status', () => {
      const pendingOrder = makeOrder({ id: 1, status: 'pending' });
      const finishedOrder = makeOrder({ id: 2, status: 'finished' });

      store.getAll().subscribe();
      const req = httpMock.expectOne(url);
      req.flush([pendingOrder, finishedOrder]);

      expect(store.pendingOrders()).toEqual([pendingOrder]);
      expect(store.finishedOrders()).toEqual([finishedOrder]);
      expect(store.orders()).toEqual([pendingOrder, finishedOrder]);
    });

    it('accumulates across repeated calls without throwing (regression: Akita used to freeze stored arrays)', () => {
      store.getAll().subscribe();
      httpMock.expectOne(url).flush([makeOrder({ id: 1, status: 'pending' })]);

      expect(() => {
        store.getAll().subscribe();
        httpMock.expectOne(url).flush([makeOrder({ id: 2, status: 'finished' })]);
      }).not.toThrow();

      expect(store.pendingOrders()?.length).toBe(1);
      expect(store.finishedOrders()?.length).toBe(1);
    });
  });

  describe('get', () => {
    it('requests the base url when no id is given', () => {
      store.get().subscribe();
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('requests a single order by id', () => {
      store.get(7).subscribe();
      const req = httpMock.expectOne(`${url}/7`);
      expect(req.request.method).toBe('GET');
      req.flush([makeOrder({ id: 7 })]);
    });
  });

  describe('addOrder', () => {
    it('posts the new order and refreshes the order list', () => {
      const newOrder = makeOrder({ id: 3 });
      store.addOrder(newOrder);

      const postReq = httpMock.expectOne(r => r.url === url && r.method === 'POST');
      expect(postReq.request.body).toEqual(newOrder);
      postReq.flush(newOrder);

      const getReq = httpMock.expectOne(r => r.url === url && r.method === 'GET');
      getReq.flush([newOrder]);
    });
  });

  describe('updateStatusByOrderID', () => {
    it('fetches the order then patches its status', () => {
      store.updateStatusByOrderID(5, 'finished');

      const getReq = httpMock.expectOne(`${url}/5`);
      getReq.flush(makeOrder({ id: 5 }));

      const patchReq = httpMock.expectOne(`${url}/5`);
      expect(patchReq.request.method).toBe('PATCH');
      expect(patchReq.request.body).toEqual({ status: 'finished' });
      patchReq.flush({});
    });
  });

  describe('deleteByOrderID', () => {
    it('deletes only the order entities matching the given business orderID', () => {
      const match = makeOrder({ id: 1, orderID: 'match' });
      const other = makeOrder({ id: 2, orderID: 'other' });

      store.deleteByOrderID('match');

      const getReq = httpMock.expectOne(url);
      getReq.flush([match, other]);

      const deleteReq = httpMock.expectOne(`${url}/1`);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush({});

      httpMock.expectNone(`${url}/2`);
    });
  });
});
