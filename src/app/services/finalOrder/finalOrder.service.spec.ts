import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MyFlightsService } from 'projects/my-flights/src';
import { HotelsService } from 'projects/my-hotels/src/lib/my-hotels/hotels.service';
import { environment } from 'src/environments/environment';
import { OrderService } from '../order/order.service';
import { OrderStore } from '../order/order.store';
import { finalOrderService } from './finalOrder.service';
import { finalOrderStore } from './finalOrder.store';
import { finalOrder } from './finalOrder.model';

describe('finalOrderService', () => {
  let service: finalOrderService;
  let httpMock: HttpTestingController;
  let store: finalOrderStore;
  let orderStore: OrderStore;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;
  let flightServiceSpy: jasmine.SpyObj<MyFlightsService>;
  let hotelServiceSpy: jasmine.SpyObj<HotelsService>;

  const finalUrl = environment.api + 'finalOrder';

  beforeEach(() => {
    orderServiceSpy = jasmine.createSpyObj('OrderService', ['deleteByOrderID']);
    flightServiceSpy = jasmine.createSpyObj('MyFlightsService', ['deleteFlightsByOrderID']);
    hotelServiceSpy = jasmine.createSpyObj('HotelsService', ['deleteHotel']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        finalOrderService,
        finalOrderStore,
        OrderStore,
        { provide: OrderService, useValue: orderServiceSpy },
        { provide: MyFlightsService, useValue: flightServiceSpy },
        { provide: HotelsService, useValue: hotelServiceSpy }
      ]
    });

    service = TestBed.inject(finalOrderService);
    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(finalOrderStore);
    orderStore = TestBed.inject(OrderStore);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('requests with no filters when no ids are given', () => {
      service.get().subscribe();
      const req = httpMock.expectOne(r => r.url === finalUrl);
      expect(req.request.params.keys().length).toBe(0);
      req.flush([]);
    });

    it('applies both the orderID and id filters when given', () => {
      service.get(42, 7).subscribe();
      const req = httpMock.expectOne(r => r.url === finalUrl);
      expect(req.request.params.get('orderID')).toBe('42');
      expect(req.request.params.get('id')).toBe('7');
      req.flush([]);
    });

    it('loads the response into the store', () => {
      const entities = [{ id: 1 } as finalOrder];
      service.get().subscribe();
      const req = httpMock.expectOne(r => r.url === finalUrl);
      req.flush(entities);

      expect(store.getValue().entities?.[1]).toEqual(entities[0]);
    });
  });

  describe('addfinalOrder', () => {
    it('cleans up the pending order, flight and hotel before posting the final order', () => {
      const request = { order: { orderID: 'order-1' } } as any;

      service.addfinalOrder(request);

      expect(orderServiceSpy.deleteByOrderID).toHaveBeenCalledWith('order-1');
      expect(hotelServiceSpy.deleteHotel).toHaveBeenCalledWith('order-1');
      expect(flightServiceSpy.deleteFlightsByOrderID).toHaveBeenCalledWith('order-1');

      const req = httpMock.expectOne(finalUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(request);
    });

    it('skips cleanup and still posts when there is no orderID', () => {
      const request = { order: {} } as any;

      service.addfinalOrder(request);

      expect(orderServiceSpy.deleteByOrderID).not.toHaveBeenCalled();
      expect(hotelServiceSpy.deleteHotel).not.toHaveBeenCalled();
      expect(flightServiceSpy.deleteFlightsByOrderID).not.toHaveBeenCalled();

      const req = httpMock.expectOne(finalUrl);
      req.flush(request);
    });
  });

  describe('add', () => {
    it('adds the final order to the store and removes the source order', () => {
      spyOn(orderStore, 'remove');
      const order = { id: 1, order: { id: 9 } as any } as finalOrder;

      service.add(order);

      expect(orderStore.remove).toHaveBeenCalledWith(9);
      expect(store.getValue().entities?.[1]).toEqual(order);
    });
  });

  describe('update/remove', () => {
    it('merges a partial update into the stored entity', () => {
      store.add({ id: 1, order: { id: 9 } as any } as finalOrder);
      service.update(1, { order: { id: 9, choice: 'hotel' } as any });
      expect(store.getValue().entities?.[1]?.order?.choice).toBe('hotel');
    });

    it('removes the entity by id', () => {
      store.add({ id: 1 } as finalOrder);
      service.remove(1);
      expect(store.getValue().entities?.[1]).toBeUndefined();
    });
  });
});
