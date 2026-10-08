import { TestBed } from '@angular/core/testing';
import { API_URL, Flights } from '@vica-assist/shared';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MyFlightsService } from './my-flights.service';

describe('MyFlightsService', () => {
  let service: MyFlightsService;
  let httpMock: HttpTestingController;

  const url = 'http://localhost:3000/flights';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: API_URL, useValue: 'http://localhost:3000/' }],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(MyFlightsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getFlights returns an array of flights', () => {
    const flights: Flights[] = [{ id: 1 }, { id: 2 }];
    let result: Flights[] | undefined;

    service.getFlights().subscribe(data => (result = data as Flights[]));

    const req = httpMock.expectOne(url);
    req.flush(flights);

    expect(result).toEqual(flights);
  });

  it('getFlightsByOrderID filters by orderID', () => {
    service.getFlightsByOrderID('order-1').subscribe();

    const req = httpMock.expectOne(r => r.url === url);
    expect(req.request.params.get('orderID')).toBe('order-1');
    req.flush([]);
  });

  describe('deleteFlightsByOrderID', () => {
    it('deletes only the flights matching the given orderID', () => {
      const match: Flights = { id: 1, orderID: 'order-1' };
      const other: Flights = { id: 2, orderID: 'order-2' };

      service.deleteFlightsByOrderID('order-1');

      const getReq = httpMock.expectOne(r => r.url === url);
      getReq.flush([match, other]);

      const deleteReq = httpMock.expectOne(`${url}/1`);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush({});

      httpMock.expectNone(`${url}/2`);
    });
  });
});
