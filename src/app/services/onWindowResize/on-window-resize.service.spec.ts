import { TestBed } from '@angular/core/testing';

import { OnWindowResizeService } from './on-window-resize.service';

describe('OnWindowResizeService', () => {
  let service: OnWindowResizeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnWindowResizeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
