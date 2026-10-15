import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { Agent, API_URL, finalOrder, Order, provideAppIcons } from '@vica-assist/shared';

import { DESTINATIONS } from 'src/app/modules/shared/destinations/destinations.testing';
import { AgentStore } from 'src/app/services/agent/agent.store';
import { DestinationStore } from 'src/app/services/destination/destination.store';
import { BookingStore } from 'src/app/services/booking/booking.store';
import { FinalOrderStore } from 'src/app/services/finalOrder/finalOrder.store';
import { OrderStore } from 'src/app/services/order/order.store';
import { SessionStore } from 'src/app/services/session/session.store';
import { UserHomepageComponent } from './user-homepage.component';

const maya: Agent = {
  id: 1, username: 'maya', displayName: 'Maya Cohen', title: 'Senior travel agent', bio: '', languages: ['Hebrew', 'English'],
  specialties: [], yearsExperience: 5, email: 'maya@example.com', available: true, active: true
};

const order = (id: number, overrides: Partial<Order> = {}): Order => ({
  id, orderID: `${id}`, choice: 'both', status: 'pending', departureDate: '2026-06-12', returnDate: '2026-06-18', origin: 'Tel Aviv',
  destination: 'Paris', destinationId: 'paris', passDetails: [{ fullName: 'Dana Levi', passID: 1 }, { fullName: 'Noa Levi', passID: 2 }], priceRange: 1000,
  customer: 'dana', agent: 'maya', createdAt: `2026-10-0${id}T09:00:00.000Z`, ...overrides
});

describe('UserHomepageComponent', () => {
  const setUp = ({ orders = [] as Order[], agents = [maya], bookings = [] as finalOrder[], username = 'dana' } = {}) => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UserHomepageComponent],
      providers: [{ provide: API_URL, useValue: 'http://localhost:3000/' }, provideRouter([]), provideAppIcons()]
    });
    patchState(unprotected(TestBed.inject(DestinationStore)), { destinations: [...DESTINATIONS] });
    patchState(unprotected(TestBed.inject(SessionStore)), { username, role: 'customer' });
    patchState(unprotected(TestBed.inject(OrderStore)), { orders });
    patchState(unprotected(TestBed.inject(AgentStore)), { agents });
    patchState(unprotected(TestBed.inject(BookingStore)), { bookings });
    const fixture = TestBed.createComponent(UserHomepageComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    return { fixture, host, text: () => host.textContent?.replace(/\s+/g, ' ') ?? '' };
  };

  it('greets the customer by the first name on their latest order, and links to the booking pages', () => {
    const { host, text } = setUp({ orders: [order(1)] });

    expect(text()).toContain('Welcome back, Dana');
    expect(Array.from(host.querySelectorAll('.action-card')).map(card => card.getAttribute('href'))).toEqual(['/homepage/book', '/homepage/bookings']);
  });

  it('falls back to the username before there is an order', () => {
    expect(setUp({ username: 'dana' }).text()).toContain('Welcome back, dana');
  });

  it('counts the pending and ready orders of this customer only', () => {
    const { host } = setUp({
      orders: [order(1), order(2, { status: 'finished' }), order(3, { customer: 'noa' }), order(4, { status: 'cancelled' })]
    });

    const chips = Array.from(host.querySelectorAll('.action-card__head .chip')).map(chip => chip.textContent?.trim());
    expect(chips).toEqual(['1 pending', '1 ready']);
  });

  it('shows the destination photo on an order, and the emoji when the photo cannot load', () => {
    const { host, fixture } = setUp({ orders: [order(1)] });
    const photo = host.querySelector('.order destination-art img') as HTMLImageElement;
    expect(photo.getAttribute('src')).toBe('assets/images/img/paris.jpg');

    photo.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(host.querySelector('.order destination-art img')).toBeNull();
    expect(host.querySelector('.order destination-art')?.textContent).toContain('🗼');
  });

  it('lists the newest three orders with their trip details and stage', () => {
    const { host, text } = setUp({ orders: [order(1), order(2, { destination: 'Tokyo', destinationId: 'tokyo', choice: 'flight', passDetails: [{ fullName: 'Dana Levi', passID: 1 }] }), order(3), order(4)] });

    const rows = host.querySelectorAll('.order');
    expect(rows).toHaveLength(3);
    expect(rows[0].textContent).toContain('Paris');
    expect(text()).toContain('Flight + Hotel · Jun 12 – Jun 18 · 2 travelers');
    expect(text()).toContain('Flight · Jun 12 – Jun 18 · 1 traveler');
    expect(rows[0].querySelector('[role="progressbar"]')?.getAttribute('aria-valuetext')).toBe('Agent choosing options');
  });

  it('shows a request without an agent as just sent', () => {
    const { host } = setUp({ orders: [order(1, { agent: undefined })] });

    expect(host.querySelector('.order .chip')?.textContent?.trim()).toBe('Request sent');
    expect(host.querySelector('.order [role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('1');
  });

  it('offers Confirm booking only for an order that is ready, and opens the final order', () => {
    const { host, fixture } = setUp({ orders: [order(1), order(2, { status: 'finished' })] });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    const buttons = host.querySelectorAll<HTMLButtonElement>('.order button');
    expect(buttons).toHaveLength(1);
    buttons[0].click();
    fixture.detectChanges();

    expect(TestBed.inject(FinalOrderStore).order()?.id).toBe(2);
    expect(navigate).toHaveBeenCalledWith(['final-order', 2]);
  });

  it('includes a booked trip as booked, but not when an open request has the same number', () => {
    const booked = { id: 9, order: order(9, { status: 'finished', destination: 'Rome', destinationId: 'paris' }) } as finalOrder;
    const reused = { id: 10, order: order(1, { destination: 'Madrid', destinationId: 'paris' }) } as finalOrder;
    const { host, text } = setUp({ orders: [order(1)], bookings: [booked, reused] });

    expect(text()).toContain('Rome');
    expect(text()).not.toContain('Madrid');
    expect(Array.from(host.querySelectorAll('.order .chip')).map(chip => chip.textContent?.trim())).toContain('Booked');
  });

  it('says so, and invites a first booking, when there are no orders', () => {
    const { host } = setUp();

    expect(host.querySelector('.orders__empty a')?.getAttribute('href')).toBe('/homepage/book');
    expect(host.querySelector('.agent-card')).toBeNull();
  });

  it('shows the agent of the latest request with rating, languages, answer time and a message link', () => {
    const rated = { id: 5, order: order(5, { customer: 'noa' }), feedback: { hotelRating: 5, flightRating: 4, ratedAt: 'x' } } as finalOrder;
    const { host, text } = setUp({ orders: [order(1), order(2)], bookings: [rated] });

    expect(text()).toContain('Maya Cohen');
    expect(text()).toContain('★ 4.5 from 1 review');
    expect(text()).toContain('Hebrew, English');
    expect(text()).toContain('within 24 hours');
    expect(host.querySelector('.agent-card__message')?.getAttribute('href')).toBe('/homepage/messages?agent=maya');
    expect(host.querySelector('.agent-card__message')?.textContent?.trim()).toBe('Message Maya');
  });

  it('leaves out the rating before the agent has any', () => {
    expect(setUp({ orders: [order(1)] }).text()).not.toContain('★');
  });

  it('starts a booking for a destination chosen under Hot right now', () => {
    const { host, fixture } = setUp();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    host.querySelector<HTMLButtonElement>('.hot destination-card button')?.click();
    fixture.detectChanges();

    expect(navigate).toHaveBeenCalledWith(['/homepage/book'], { queryParams: { destination: 'paris' } });
  });
});
