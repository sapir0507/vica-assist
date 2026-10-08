import { ComponentFixture, TestBed } from '@angular/core/testing';
import { API_URL } from '@vica-assist/shared';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { FinalOrderComponent } from './final-order.component';

describe('FinalOrderComponent', () => {
  let component: FinalOrderComponent;
  let fixture: ComponentFixture<FinalOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      declarations: [ FinalOrderComponent ],
      providers: [
        { provide: API_URL, useValue: 'http://localhost:3000/' },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}) } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
