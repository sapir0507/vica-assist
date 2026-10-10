import { ComponentFixture, TestBed } from '@angular/core/testing';
import { API_URL } from '@vica-assist/shared';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { FinalOrderComponent } from './final-order.component';

describe('FinalOrderComponent', () => {
  let component: FinalOrderComponent;
  let fixture: ComponentFixture<FinalOrderComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      declarations: [ FinalOrderComponent ],
      providers: [
        { provide: API_URL, useValue: 'http://localhost:3000/' },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '2' }) } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(FinalOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('reads the order id from the route and passes it to both pickers', () => {
    const hotel = fixture.nativeElement.querySelector('app-choose-hotel');
    const flight = fixture.nativeElement.querySelector('app-choose-flight');

    expect(component.myParam).toBe('2');
    expect(hotel).not.toBeNull();
    expect(flight).not.toBeNull();
  });

  it('has a real page heading', () => {
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Choose your hotel and flight');
  });

  it('does not request flights or hotels itself; the pickers fetch their own', () => {
    httpMock.expectNone(r => /\/(flights|hotels)\b/.test(r.url));
  });
});
