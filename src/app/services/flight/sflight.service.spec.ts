import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { Flights, FlightsRequest } from '@vica-assist/shared';
import { SflightService } from './sflight.service';

describe('SflightService', () => {
  let service: SflightService;
  let httpMock: HttpTestingController;

  const url = environment.api + 'flights';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SflightService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getFlights fetches every flight', () => {
    const flights: Flights[] = [{ id: 1 }, { id: 2 }];
    let result: Flights[] | undefined;

    service.getFlights().subscribe(data => (result = data));

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush(flights);

    expect(result).toEqual(flights);
  });

  it('getFlight filters by orderID', () => {
    service.getFlight(5).subscribe();

    const req = httpMock.expectOne(r => r.url === url);
    expect(req.request.params.get('orderID')).toBe('5');
    req.flush([]);
  });

  it('addFlight posts the new flight', () => {
    const newFlight: FlightsRequest = { orderID: 'abc' };
    service.addFlight(newFlight);

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newFlight);
    req.flush({});
  });
});
