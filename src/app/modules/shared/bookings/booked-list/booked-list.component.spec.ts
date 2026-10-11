import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
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
    destination: `city ${id}`,
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
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideAppIcons()]
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

  it('shows only the signed-in customer\'s bookings, latest trip first', () => {
    httpMock.expectOne(url).flush([
      booking(1, 'dana', '2026-01-01'),
      booking(2, 'noa', '2026-02-01'),
      booking(3, 'dana', '2026-03-01')
    ]);
    fixture.detectChanges();

    const titles = Array.from(host().querySelectorAll('.order-card__title')).map(t => t.textContent?.trim());
    expect(titles).toEqual(['City 3', 'City 1']);
  });

  it('explains how a booking appears when there are none', () => {
    httpMock.expectOne(url).flush([booking(2, 'noa', '2026-02-01')]);
    fixture.detectChanges();

    expect(host().textContent).toContain('No bookings yet');
  });
});
