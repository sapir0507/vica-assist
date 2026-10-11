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
    it('keeps cancelled requests out of the pending list but in the full list', () => {
      const cancelled = makeOrder({ id: 3, status: 'cancelled' });
      const pending = makeOrder({ id: 4, status: 'pending' });

      store.getAll().subscribe();
      httpMock.expectOne(url).flush([cancelled, pending]);

      expect(store.pendingOrders()).toEqual([pending]);
      expect(store.cancelledOrders()).toEqual([cancelled]);
      expect(store.orders()).toEqual([pending, cancelled]);
    });

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

    it('replaces the lists on repeated calls instead of piling up duplicates', () => {
      const order = makeOrder({ id: 1, status: 'pending' });
      store.getAll().subscribe();
      httpMock.expectOne(url).flush([order]);

      store.getAll().subscribe();
      httpMock.expectOne(url).flush([order, makeOrder({ id: 2, status: 'finished' })]);

      expect(store.pendingOrders()).toEqual([order]);
      expect(store.finishedOrders()?.map(o => o.id)).toEqual([2]);
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
    it('posts the new order, hands back what was created and refreshes the order list', () => {
      const newOrder = makeOrder({ id: 3 });
      let created: Order | undefined;
      store.addOrder(newOrder).subscribe(order => (created = order));

      const postReq = httpMock.expectOne(r => r.url === url && r.method === 'POST');
      expect(postReq.request.body).toEqual(newOrder);
      httpMock.expectNone(r => r.url === url && r.method === 'GET');
      postReq.flush(newOrder);
      expect(created).toEqual(newOrder);

      const getReq = httpMock.expectOne(r => r.url === url && r.method === 'GET');
      getReq.flush([newOrder]);
    });
  });

  describe('updateStatusByOrderID', () => {
    it('patches the status, stamps when the agent answered, and refreshes the lists', () => {
      store.updateStatusByOrderID(5, 'finished');

      const patchReq = httpMock.expectOne(`${url}/5`);
      expect(patchReq.request.method).toBe('PATCH');
      expect(patchReq.request.body.status).toBe('finished');
      expect(Number.isNaN(Date.parse(patchReq.request.body.respondedAt))).toBe(false);
      patchReq.flush({});

      const order = makeOrder({ id: 5, status: 'finished' });
      httpMock.expectOne(url).flush([order]);
      expect(store.finishedOrders()).toEqual([order]);
      expect(store.pendingOrders()).toEqual([]);
    });

    it('does not stamp a response time for other statuses', () => {
      store.updateStatusByOrderID(5, 'pending');

      const patchReq = httpMock.expectOne(`${url}/5`);
      expect(patchReq.request.body).toEqual({ status: 'pending' });
      patchReq.flush({});
      httpMock.expectOne(url).flush([]);
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
      httpMock.expectOne(url).flush([other]);
      expect(store.orders()).toEqual([other]);
    });
  });

  describe('reassign', () => {
    it('moves requests to their new agents and keeps the history', () => {
      const first = makeOrder({ id: 1, agent: 'dana', assignments: [{ agent: 'dana', at: 'then', reason: 'initial' }] });
      store.getAll().subscribe();
      httpMock.expectOne(url).flush([first, makeOrder({ id: 2, agent: 'dana' })]);

      store.reassign([{ orderId: 1, to: 'noa', reason: 'overdue' }, { orderId: 2, to: 'lee', reason: 'agent-unavailable' }]);

      const one = httpMock.expectOne(`${url}/1`);
      expect(one.request.method).toBe('PATCH');
      expect(one.request.body.agent).toBe('noa');
      expect(one.request.body.assignments).toEqual([
        { agent: 'dana', at: 'then', reason: 'initial' },
        { agent: 'noa', at: one.request.body.assignedAt, reason: 'overdue' }
      ]);
      const two = httpMock.expectOne(`${url}/2`);
      expect(two.request.body.assignments).toEqual([{ agent: 'lee', at: two.request.body.assignedAt, reason: 'agent-unavailable' }]);
      one.flush({});
      two.flush({});

      httpMock.expectOne(url).flush([]);
    });

    it('does nothing when there is nobody to move', () => {
      store.reassign([]);

      httpMock.expectNone(() => true);
    });
  });
});
