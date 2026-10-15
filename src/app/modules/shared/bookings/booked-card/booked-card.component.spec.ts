import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { throwError, of } from 'rxjs';
import { finalOrder, provideAppIcons } from '@vica-assist/shared';

import { BookingStore } from 'src/app/services/booking/booking.store';
import { BookedCardComponent } from './booked-card.component';

const booking = (overrides: Partial<finalOrder> = {}, returnDate = '2020-06-16'): finalOrder => ({
  id: 4,
  order: {
    id: 4,
    orderID: 'o-4',
    choice: 'both',
    status: 'finished',
    departureDate: '2020-06-09',
    returnDate,
    origin: 'Tel Aviv',
    destination: 'paris', destinationId: 'paris',
    passDetails: [],
    priceRange: 1500,
    customer: 'dana'
  },
  hotel: { id: 1, name: 'Hotel Lumière', stars: 4, price: 640 },
  flight: { id: 1, org: 'Tel Aviv', dest: 'Paris', price: 420 },
  ...overrides
});

describe('BookedCardComponent', () => {
  let fixture: ComponentFixture<BookedCardComponent>;
  let rate: ReturnType<typeof vi.spyOn>;
  const host = () => fixture.nativeElement as HTMLElement;
  const buttonLabelled = (label: string) =>
    Array.from(host().querySelectorAll<HTMLButtonElement>('button')).find(b => b.textContent?.includes(label));
  const show = (value: finalOrder) => {
    fixture.componentRef.setInput('booking', value);
    fixture.detectChanges();
  };
  const click = (button: HTMLElement | undefined) => {
    button?.click();
    fixture.detectChanges();
  };
  const fillAndSend = () => {
    host().querySelectorAll<HTMLButtonElement>('star-rating')[0].querySelectorAll('button')[4].click();
    host().querySelectorAll<HTMLButtonElement>('star-rating')[1].querySelectorAll('button')[2].click();
    fixture.detectChanges();
    click(buttonLabelled('Send review'));
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, BookedCardComponent],
      providers: [provideAppIcons()]
    }).compileComponents();

    rate = vi.spyOn(TestBed.inject(BookingStore), 'rate');
    fixture = TestBed.createComponent(BookedCardComponent);
  });

  it('summarises the trip, what was chosen and what it cost against the budget', () => {
    show(booking());
    expect(host().querySelector('destination-art')).not.toBeNull();

    const text = host().textContent;
    expect(text).toContain('Paris');
    expect(text).toContain('Hotel Lumière (4 stars)');
    expect(text).toContain('$1,060.00');
    expect(text).toContain('$1,500.00');
    expect(text).toContain('Rate your trip');
  });

  it('does not offer a rating before the trip has ended', () => {
    show(booking({}, '2999-01-01'));

    expect(host().querySelector('feedback-form')).toBeNull();
    expect(host().textContent).toContain('You can rate this trip after');
    expect(host().textContent).toContain('Upcoming');
  });

  it('offers a rating form for each booked part once the trip has ended, after the row is opened', () => {
    show(booking());
    expect(host().querySelector('feedback-form')).toBeNull();

    click(buttonLabelled('Rate your trip'));

    expect(host().querySelectorAll('feedback-form star-rating')).toHaveLength(2);
  });

  it('shows how far ahead an upcoming trip is and how much of the budget it uses', () => {
    show(booking({}, '2999-01-01'));

    expect(host().querySelector('.trip__leaves')?.textContent).toBeTruthy();
    expect(host().querySelector('.ring')).not.toBeNull();
    expect(host().querySelector('.trip__line mat-icon')).not.toBeNull();
  });

  it('opens and closes the details when anywhere on the row is clicked', () => {
    show(booking());
    const row = () => host().querySelector<HTMLElement>('.trip__row');

    click(row() ?? undefined);
    expect(host().querySelector('.trip__details')).not.toBeNull();
    click(row() ?? undefined);
    expect(host().querySelector('.trip__details')).toBeNull();
  });

  it('keeps the row open when Rate your trip is clicked, instead of toggling it twice', () => {
    show(booking());

    click(buttonLabelled('Rate your trip'));

    expect(host().querySelector('.trip__details')).not.toBeNull();
  });

  it('opens and closes the details of a past trip', () => {
    show(booking());
    const toggle = () => host().querySelector<HTMLButtonElement>('.trip__toggle');

    expect(toggle()?.getAttribute('aria-expanded')).toBe('false');
    click(toggle() ?? undefined);
    expect(toggle()?.getAttribute('aria-expanded')).toBe('true');
    expect(host().querySelector('.trip__details')).not.toBeNull();
    click(toggle() ?? undefined);
    expect(host().querySelector('.trip__details')).toBeNull();
  });

  it('sends the rating to the store and shows the review afterwards', () => {
    rate.mockImplementation(() => of({} as finalOrder));
    show(booking());
    click(buttonLabelled('Rate your trip'));

    fillAndSend();

    expect(rate).toHaveBeenCalledWith(4, { hotelRating: 5, flightRating: 3, review: '' });
  });

  it('shows the reason when the store refuses the rating', () => {
    rate.mockImplementation(() => throwError(() => new Error('You can rate a trip after it has ended.')));
    show(booking());
    click(buttonLabelled('Rate your trip'));

    fillAndSend();

    expect(host().querySelector('[role="alert"]')?.textContent).toContain('after it has ended');
  });

  it('shows an existing review read-only and lets it be edited and cancelled', () => {
    show(booking({ feedback: { hotelRating: 4, flightRating: 2, review: 'Nice <b>stay</b>', ratedAt: '2020-06-20T10:00:00.000Z' } }));
    expect(host().querySelector('.rating-chip')?.textContent).toContain('3.0');
    click(host().querySelector<HTMLButtonElement>('.trip__toggle') ?? undefined);

    expect(host().querySelectorAll('star-rating span[role="img"]')).toHaveLength(2);
    expect(host().querySelector('.booked__review')?.textContent).toBe('Nice <b>stay</b>');
    expect(host().querySelector('.booked__review b')).toBeNull();

    click(buttonLabelled('Edit review'));
    expect(host().textContent).toContain('Edit your review');
    expect((host().querySelector('textarea') as HTMLTextAreaElement).value).toBe('Nice <b>stay</b>');

    click(buttonLabelled('Cancel'));
    expect(host().textContent).toContain('Your review');
  });

  it('only asks about the hotel for a hotel-only booking', () => {
    show(booking({ flight: undefined, order: { ...booking().order!, choice: 'hotel' } }));
    click(buttonLabelled('Rate your trip'));

    expect(host().querySelectorAll('feedback-form star-rating')).toHaveLength(1);
  });
});
