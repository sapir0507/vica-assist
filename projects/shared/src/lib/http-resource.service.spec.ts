import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpResourceService } from './http-resource.service';

interface Thing { id: number; orderID?: string }

@Injectable()
class ThingService extends HttpResourceService<Thing, Omit<Thing, 'id'>> {
  protected readonly resourceUrl = 'http://api.test/things';

  list() { return this.getAll(); }
  add(request: Omit<Thing, 'id'>) { return this.create(request); }
  removeByOrder(orderID: string) { this.deleteByOrderID(orderID); }
}

describe('HttpResourceService', () => {
  let service: ThingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ThingService]
    });
    service = TestBed.inject(ThingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists resources from the resource url', () => {
    let result: Thing[] | undefined;
    service.list().subscribe(things => (result = things));

    httpMock.expectOne('http://api.test/things').flush([{ id: 1 }]);

    expect(result).toEqual([{ id: 1 }]);
  });

  it('posts a new resource', () => {
    let result: Thing | undefined;
    service.add({ orderID: 'o1' }).subscribe(thing => (result = thing));

    const req = httpMock.expectOne('http://api.test/things');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 7, orderID: 'o1' });

    expect(result).toEqual({ id: 7, orderID: 'o1' });
  });

  it('deletes only the items that belong to the order', () => {
    service.removeByOrder('o1');

    httpMock
      .expectOne(r => r.url === 'http://api.test/things' && r.params.get('orderID') === 'o1')
      .flush([{ id: 1, orderID: 'o1' }, { id: 2, orderID: 'other' }]);

    expect(httpMock.expectOne('http://api.test/things/1').request.method).toBe('DELETE');
    httpMock.expectNone('http://api.test/things/2');
  });
});
