import { TestBed } from '@angular/core/testing';

import { MyHotelsService } from './my-hotels.service';

describe('MyHotelsService', () => {
  let service: MyHotelsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyHotelsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
