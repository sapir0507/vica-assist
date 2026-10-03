import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Hotel, HotelRequest } from 'src/app/interfaces/hotel.interface';
import { HotelsService } from './hotels.service';

describe('HotelsService', () => {
  let service: HotelsService;
  let httpMock: HttpTestingController;

  const url = 'http://localhost:3000/hotels';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(HotelsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getHotels returns an array of hotels', () => {
    const hotels: Hotel[] = [{ id: 1 }, { id: 2 }];
    let result: Hotel[] | undefined;

    service.getHotels().subscribe(data => (result = data));

    const req = httpMock.expectOne(url);
    req.flush(hotels);

    expect(result).toEqual(hotels);
  });

  it('getHotelsByOrderID filters by orderID', () => {
    service.getHotelsByOrderID(7).subscribe();

    const req = httpMock.expectOne(r => r.url === url);
    expect(req.request.params.get('orderID')).toBe('7');
    req.flush([]);
  });

  it('addHotel posts the new hotel', () => {
    const newHotel: HotelRequest = { name: 'Hilton' };
    service.addHotel(newHotel);

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newHotel);
    req.flush({});
  });

  describe('deleteHotel', () => {
    it('deletes only the hotels matching the given orderID', () => {
      const match: Hotel = { id: 1, orderID: 'order-1' };
      const other: Hotel = { id: 2, orderID: 'order-2' };

      service.deleteHotel('order-1');

      const getReq = httpMock.expectOne(r => r.url === url);
      getReq.flush([match, other]);

      const deleteReq = httpMock.expectOne(`${url}/1`);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush({});

      httpMock.expectNone(`${url}/2`);
    });
  });
});
