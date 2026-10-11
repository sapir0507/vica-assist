import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { finalOrder, Order, provideAppIcons } from '@vica-assist/shared';

import { environment } from 'src/environments/environment';
import { OrderStore } from 'src/app/services/order/order.store';
import { InsightsComponent } from './insights.component';

const url = environment.api + 'finalOrder';

const order = (id: number, overrides: Partial<Order> = {}): Order => ({
  id,
  orderID: `o-${id}`,
  choice: 'both',
  status: 'pending',
  departureDate: '2026-03-01',
  returnDate: '2026-03-08',
  origin: 'Tel Aviv',
  destination: 'paris',
  passDetails: [],
  priceRange: 1000,
  ...overrides
});

const booking = (id: number, feedback?: finalOrder['feedback']): finalOrder => ({
  id,
  order: order(id, { status: 'finished' }),
  hotel: { id, price: 400 },
  flight: { id, price: 200 },
  bookedAt: '2026-03-01T10:00:00.000Z',
  feedback
});

describe('InsightsComponent', () => {
  let fixture: ComponentFixture<InsightsComponent>;
  let httpMock: HttpTestingController;
  const host = () => fixture.nativeElement as HTMLElement;
  const text = () => host().textContent?.replace(/\s+/g, ' ') ?? '';
  const stat = (label: string) =>
    Array.from(host().querySelectorAll('.stat'))
      .find(s => s.querySelector('.stat__label')?.textContent?.includes(label))
      ?.querySelector('.stat__value')?.textContent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InsightsComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideAppIcons()]
    });
    httpMock = TestBed.inject(HttpTestingController);
    TestBed.inject(OrderStore);
    httpMock.expectOne(environment.api + 'orders').flush([order(1), order(2, { status: 'finished' })]);
    fixture = TestBed.createComponent(InsightsComponent);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  const load = (...bookings: finalOrder[]) => {
    httpMock.expectOne(url).flush(bookings);
    fixture.detectChanges();
  };

  it('says it is loading until the bookings arrive', () => {
    expect(text()).toContain('Loading insights');
    load();
  });

  it('shows the funnel, satisfaction and business numbers', () => {
    load(
      booking(3, { hotelRating: 5, flightRating: 3, review: 'Lovely trip', ratedAt: '2026-03-10T10:00:00.000Z' }),
      booking(4)
    );

    expect(stat('Received')).toBe('4');
    expect(stat('Awaiting your answer')).toBe('1');
    expect(stat('Waiting for the customer')).toBe('1');
    expect(stat('Booked')).toBe('2');
    expect(text()).toContain('Booked (50% of requests)');
    expect(text()).toContain('1 of 2 completed trips were reviewed (50%)');
    expect(text()).toContain('100% were pleased');
    expect(text()).toContain('Lovely trip');
    expect(stat('Total booked')).toBe('$1,200');
    expect(stat('budget used')).toBe('60%');
    expect(host().querySelectorAll('.panel')).toHaveLength(5);
  });

  it('shows empty states instead of numbers that do not exist', () => {
    load();

    expect(text()).toContain('No ratings yet.');
    expect(text()).toContain('No written reviews yet.');
    expect(text()).toContain('No trip has ended yet');
    expect(text()).toContain('Not enough data');
    expect(text()).not.toContain('NaN');
  });

  it('tells the agent when records had to be left out', () => {
    load({ id: 9 } as finalOrder);

    expect(text()).toContain('1 booking has incomplete data');
  });

  it('formats the response time in minutes, hours or days', () => {
    load();
    const { componentInstance: component } = fixture;

    expect(component.responseTime(null)).toBe('Not enough data');
    expect(component.responseTime(0.5)).toBe('30 minutes');
    expect(component.responseTime(4.5)).toBe('4.5 hours');
    expect(component.responseTime(72)).toBe('3 days');
  });
});
