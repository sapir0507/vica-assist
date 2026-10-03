import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { Order as OrderInt } from 'src/interfaces/order.interface';
import { OrderService } from './order.service';
import { OrderStore } from './order.store';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;
  let store: OrderStore;

  const url = environment.api + 'orders';

  const makeOrder = (overrides: Partial<OrderInt> = {}): OrderInt => ({
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
      imports: [HttpClientTestingModule],
      providers: [OrderService, OrderStore]
    });

    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(OrderStore);

    // The constructor calls getAll(); flush it so each test starts clean.
    const req = httpMock.expectOne(url);
    req.flush([]);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('splits orders into pending and finished buckets by status', () => {
      const pendingOrder = makeOrder({ id: 1, status: 'pending' });
      const finishedOrder = makeOrder({ id: 2, status: 'finished' });

      service.getAll().subscribe();
      const req = httpMock.expectOne(url);
      req.flush([pendingOrder, finishedOrder]);

      const state = store.getValue() as unknown as {
        pendingOrders?: OrderInt[];
        finishedOrders?: OrderInt[];
        orders?: OrderInt[];
      };

      expect(state.pendingOrders).toEqual([pendingOrder]);
      expect(state.finishedOrders).toEqual([finishedOrder]);
      expect(state.orders).toEqual([pendingOrder, finishedOrder]);
    });

    it('accumulates across repeated calls without throwing (regression: Akita freezes stored arrays)', () => {
      service.getAll().subscribe();
      httpMock.expectOne(url).flush([makeOrder({ id: 1, status: 'pending' })]);

      expect(() => {
        service.getAll().subscribe();
        httpMock.expectOne(url).flush([makeOrder({ id: 2, status: 'finished' })]);
      }).not.toThrow();

      const state = store.getValue() as unknown as {
        pendingOrders?: OrderInt[];
        finishedOrders?: OrderInt[];
      };
      expect(state.pendingOrders?.length).toBe(1);
      expect(state.finishedOrders?.length).toBe(1);
    });
  });

  describe('get', () => {
    it('requests the base url when no id is given', () => {
      service.get().subscribe();
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('requests a single order by id', () => {
      service.get(7).subscribe();
      const req = httpMock.expectOne(`${url}/7`);
      expect(req.request.method).toBe('GET');
      req.flush([makeOrder({ id: 7 })]);
    });
  });

  describe('addOrder', () => {
    it('posts the new order and refreshes the order list', () => {
      const newOrder = makeOrder({ id: 3 });
      service.addOrder(newOrder);

      const postReq = httpMock.expectOne(r => r.url === url && r.method === 'POST');
      expect(postReq.request.body).toEqual(newOrder);
      postReq.flush(newOrder);

      const getReq = httpMock.expectOne(r => r.url === url && r.method === 'GET');
      getReq.flush([newOrder]);
    });
  });

  describe('updateStatusByOrderID', () => {
    it('fetches the order then patches its status', () => {
      service.updateStatusByOrderID(5, 'finished');

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

      service.deleteByOrderID('match');

      const getReq = httpMock.expectOne(url);
      getReq.flush([match, other]);

      const deleteReq = httpMock.expectOne(`${url}/1`);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush({});

      httpMock.expectNone(`${url}/2`);
    });
  });
});
