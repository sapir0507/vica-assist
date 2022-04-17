import { TestBed } from '@angular/core/testing';

import { IUserService } from './iuser.service';

describe('IUserService', () => {
  let service: IUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
