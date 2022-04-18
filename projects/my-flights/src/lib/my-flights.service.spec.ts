import { TestBed } from '@angular/core/testing';

import { MyFlightsService } from './my-flights.service';

describe('MyFlightsService', () => {
  let service: MyFlightsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyFlightsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
