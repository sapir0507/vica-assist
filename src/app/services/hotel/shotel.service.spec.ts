import { TestBed } from '@angular/core/testing';

import { ShotelService } from './shotel.service';

describe('ShotelService', () => {
  let service: ShotelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShotelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
