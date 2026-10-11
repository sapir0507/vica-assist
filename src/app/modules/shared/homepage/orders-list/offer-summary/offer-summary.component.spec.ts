import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { API_URL } from '@vica-assist/shared';

import { OfferSummaryComponent } from './offer-summary.component';

describe('OfferSummaryComponent', () => {
  let fixture: ComponentFixture<OfferSummaryComponent>;
  let httpMock: HttpTestingController;
  const text = () => (fixture.nativeElement as HTMLElement).textContent?.trim();
  const answer = (hotels: unknown[], flights: unknown[]) => {
    httpMock.expectOne(r => r.url.endsWith('/hotels') && r.params.get('orderID') === '7').flush(hotels);
    httpMock.expectOne(r => r.url.endsWith('/flights') && r.params.get('orderID') === '7').flush(flights);
    fixture.detectChanges();
  };

  const create = (choice: string) => {
    fixture = TestBed.createComponent(OfferSummaryComponent);
    fixture.componentRef.setInput('orderId', 7);
    fixture.componentRef.setInput('choice', choice);
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, OfferSummaryComponent],
      providers: [{ provide: API_URL, useValue: 'http://localhost:3000/' }]
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify({ ignoreCancelled: true }));

  it('counts the hotels and flights the agent added', () => {
    create('both');
    answer([{}, {}, {}], [{}]);

    expect(text()).toBe('Your agent added 3 hotels and 1 flight to choose from');
  });

  it('only mentions the parts the customer asked for', () => {
    create('flight');
    answer([{}], [{}, {}]);

    expect(text()).toBe('Your agent added 2 flights to choose from');
  });

  it('shows nothing while loading or when the options cannot be fetched', () => {
    create('both');
    expect(text()).toBe('');

    httpMock.expectOne(r => r.url.endsWith('/hotels')).flush('x', { status: 500, statusText: 'error' });
    fixture.detectChanges();

    expect(text()).toBe('');
  });
});
