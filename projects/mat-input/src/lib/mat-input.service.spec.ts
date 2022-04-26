import { TestBed } from '@angular/core/testing';

import { MatInputService } from './mat-input.service';

describe('MatInputService', () => {
  let service: MatInputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatInputService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
