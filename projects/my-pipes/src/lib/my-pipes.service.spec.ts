import { TestBed } from '@angular/core/testing';

import { MyPipesService } from './my-pipes.service';

describe('MyPipesService', () => {
  let service: MyPipesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyPipesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
