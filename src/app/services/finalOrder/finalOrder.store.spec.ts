import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { MyFlightsService } from 'projects/my-flights/src';
import { HotelsService } from 'projects/my-hotels/src/lib/my-hotels/hotels.service';
import { environment } from 'src/environments/environment';
import { OrderStore } from '../order/order.store';
import { FinalOrderStore } from './finalOrder.store';

describe('FinalOrderStore', () => {
  let store: InstanceType<typeof FinalOrderStore>;
  let httpMock: HttpTestingController;
  let orderStoreSpy: jasmine.SpyObj<InstanceType<typeof OrderStore>>;
  let flightServiceSpy: jasmine.SpyObj<MyFlightsService>;
  let hotelServiceSpy: jasmine.SpyObj<HotelsService>;

  const finalUrl = environment.api + 'finalOrder';

  beforeEach(() => {
    orderStoreSpy = jasmine.createSpyObj('OrderStore', ['deleteByOrderID']);
    flightServiceSpy = jasmine.createSpyObj('MyFlightsService', ['deleteFlightsByOrderID']);
    hotelServiceSpy = jasmine.createSpyObj('HotelsService', ['deleteHotel']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: OrderStore, useValue: orderStoreSpy },
        { provide: MyFlightsService, useValue: flightServiceSpy },
        { provide: HotelsService, useValue: hotelServiceSpy }
      ]
    });

    store = TestBed.inject(FinalOrderStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('starts empty', () => {
    expect(store.order()).toBeUndefined();
    expect(store.flight()).toBeUndefined();
    expect(store.hotel()).toBeUndefined();
  });

  describe('update', () => {
    it('patches only the order field', () => {
      const order = { id: 1, orderID: 'order-1' } as any;
      store.update({ order });

      expect(store.order()).toEqual(order);
      expect(store.flight()).toBeUndefined();
      expect(store.hotel()).toBeUndefined();
    });

    it('patches only the flight field', () => {
      const flight = { id: 2 } as any;
      store.update({ flight });

      expect(store.flight()).toEqual(flight);
      expect(store.order()).toBeUndefined();
      expect(store.hotel()).toBeUndefined();
    });

    it('patches only the hotel field', () => {
      const hotel = { id: 3 } as any;
      store.update({ hotel });

      expect(store.hotel()).toEqual(hotel);
      expect(store.order()).toBeUndefined();
      expect(store.flight()).toBeUndefined();
    });
  });

  describe('addFinalOrder', () => {
    it('cleans up the pending order, flight and hotel before posting the final order', () => {
      const request = { order: { orderID: 'order-1' } } as any;

      store.addFinalOrder(request);

      expect(orderStoreSpy.deleteByOrderID).toHaveBeenCalledWith('order-1');
      expect(hotelServiceSpy.deleteHotel).toHaveBeenCalledWith('order-1');
      expect(flightServiceSpy.deleteFlightsByOrderID).toHaveBeenCalledWith('order-1');

      const req = httpMock.expectOne(finalUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(request);
    });

    it('skips cleanup and still posts when there is no orderID', () => {
      const request = { order: {} } as any;

      store.addFinalOrder(request);

      expect(orderStoreSpy.deleteByOrderID).not.toHaveBeenCalled();
      expect(hotelServiceSpy.deleteHotel).not.toHaveBeenCalled();
      expect(flightServiceSpy.deleteFlightsByOrderID).not.toHaveBeenCalled();

      const req = httpMock.expectOne(finalUrl);
      req.flush(request);
    });
  });
});
