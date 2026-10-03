import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { Hotel, HotelRequest } from './ihotel';
import { ShotelService } from './shotel.service';

describe('ShotelService', () => {
  let service: ShotelService;
  let httpMock: HttpTestingController;

  const url = environment.api + 'hotels';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ShotelService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('uses the configured backend url rather than a hardcoded host', () => {
    service.getHotels().subscribe();
    const req = httpMock.expectOne(url);
    req.flush([]);
    expect(req.request.url).toBe(url);
  });

  it('getHotels fetches every hotel as an array', () => {
    const hotels: Hotel[] = [{ id: 1 }, { id: 2 }];
    let result: Hotel[] | undefined;

    service.getHotels().subscribe(data => (result = data));

    const req = httpMock.expectOne(url);
    req.flush(hotels);

    expect(result).toEqual(hotels);
  });

  it('addHotel posts the new hotel', () => {
    const newHotel: HotelRequest = { Name: 'Hilton' };
    service.addHotel(newHotel);

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newHotel);
    req.flush({});
  });

  it('getNewID returns 0 when no hotels are cached', () => {
    expect(service.getNewID()).toBe(0);
  });
});
