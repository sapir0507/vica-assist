import { TestBed } from '@angular/core/testing';

import { SflightService } from './sflight.service';

describe('SflightService', () => {
  let service: SflightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SflightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
