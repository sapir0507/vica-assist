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

  const resizeTo = (width: number) =>
    service.handleSizeEvent({ target: { innerWidth: width } } as unknown as UIEvent);

  it('switches back to desktop after shrinking to phone and widening past 1200px', () => {
    expect(resizeTo(400)).toBe('phone');
    expect(resizeTo(1500)).toBe('desktop');
  });

  it('maps each width range to its screen type', () => {
    expect(resizeTo(700)).toBe('tablet');
    expect(resizeTo(1000)).toBe('laptop');
    expect(resizeTo(1100)).toBe('desktop');
  });
});
