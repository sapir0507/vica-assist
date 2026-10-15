import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { finalOrder, provideAppIcons } from '@vica-assist/shared';

import { environment } from 'src/environments/environment';
import { SessionStore } from 'src/app/services/session/session.store';
import { BookedListComponent } from './booked-list.component';

const url = environment.api + 'finalOrder';

const booking = (id: number, customer: string, departureDate: string): finalOrder => ({
  id,
  order: {
    id,
    orderID: `o-${id}`,
    choice: 'hotel',
    status: 'finished',
    departureDate,
    returnDate: '2999-01-01',
    origin: 'Tel Aviv',
    destination: `city ${id}`, destinationId: 'paris',
    passDetails: [],
    priceRange: 500,
    customer
  }
});

describe('BookedListComponent', () => {
  let fixture: ComponentFixture<BookedListComponent>;
  let httpMock: HttpTestingController;
  const host = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookedListComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideAppIcons(), provideRouter([])]
    }).compileComponents();

    patchState(unprotected(TestBed.inject(SessionStore)), { username: 'dana' });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(BookedListComponent);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('says it is loading until the bookings arrive', () => {
    expect(host().textContent).toContain('Loading your bookings');
    httpMock.expectOne(url).flush([]);
  });

  it('shows only the signed-in customer\'s bookings, soonest upcoming trip first', () => {
    httpMock.expectOne(url).flush([
      booking(1, 'dana', '2026-01-01'),
      booking(2, 'noa', '2026-02-01'),
      booking(3, 'dana', '2026-03-01')
    ]);
    fixture.detectChanges();

    const titles = Array.from(host().querySelectorAll('.trip__title')).map(t => t.textContent?.trim());
    expect(titles).toEqual(['City 1', 'City 3']);
    expect(host().textContent).toContain('Upcoming');
  });

  it('puts finished trips under Past trips, latest first, with their count and total', () => {
    const past = (id: number, departureDate: string, price: number): finalOrder => ({
      ...booking(id, 'dana', departureDate),
      order: { ...booking(id, 'dana', departureDate).order!, returnDate: '2020-12-31' },
      hotel: { id, name: 'H', stars: 3, price }
    });
    httpMock.expectOne(url).flush([past(1, '2020-03-01', 100), past(2, '2020-06-01', 250)]);
    fixture.detectChanges();

    const titles = Array.from(host().querySelectorAll('.booked-list__past .trip__title')).map(t => t.textContent?.replace(/\s+/g, ' ').trim());
    expect(titles[0]).toContain('City 2');
    expect(titles[1]).toContain('City 1');
    expect(host().textContent).toContain('Past trips');
    expect(host().textContent).toContain('2 trips · $350.00 total');
    expect(host().querySelector('.booked-list__upcoming')).toBeNull();
  });

  it('explains how a booking appears when there are none', () => {
    httpMock.expectOne(url).flush([booking(2, 'noa', '2026-02-01')]);
    fixture.detectChanges();

    expect(host().textContent).toContain('No bookings yet');
  });
});
