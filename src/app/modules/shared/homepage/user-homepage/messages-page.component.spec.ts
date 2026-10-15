import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { Agent, API_URL, finalOrder, Order, provideAppIcons } from '@vica-assist/shared';

import { AgentStore } from 'src/app/services/agent/agent.store';
import { BookingStore } from 'src/app/services/booking/booking.store';
import { OrderStore } from 'src/app/services/order/order.store';
import { SessionStore } from 'src/app/services/session/session.store';
import { MessagesPageComponent } from './messages-page.component';

const agent = (username: string): Agent => ({
  id: 1, username, displayName: `${username} Cohen`, title: 'Agent', bio: '', languages: [], specialties: [], yearsExperience: 1,
  email: 'a@example.com', available: true, active: true
});

const order = (id: number, overrides: Partial<Order> = {}): Order => ({
  id, orderID: `${id}`, choice: 'both', status: 'pending', departureDate: '2026-06-12', returnDate: '2026-06-18', origin: 'Tel Aviv',
  destination: `Place ${id}`, destinationId: 'paris', passDetails: [], priceRange: 1000, customer: 'dana', agent: 'maya', createdAt: '2026-10-01T09:00:00.000Z', ...overrides
});

describe('MessagesPageComponent', () => {
  const setUp = (orders: Order[], { bookings = [] as finalOrder[], agentParam = null as string | null } = {}) => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MessagesPageComponent],
      providers: [
        { provide: API_URL, useValue: 'http://localhost:3000/' },
        provideRouter([]),
        provideAppIcons(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(agentParam ? { agent: agentParam } : {}) } } }
      ]
    });
    patchState(unprotected(TestBed.inject(SessionStore)), { username: 'dana', role: 'customer' });
    patchState(unprotected(TestBed.inject(OrderStore)), { orders });
    patchState(unprotected(TestBed.inject(AgentStore)), { agents: [agent('maya'), agent('noa')] });
    patchState(unprotected(TestBed.inject(BookingStore)), { bookings });
    const fixture = TestBed.createComponent(MessagesPageComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const options = () => Array.from(host.querySelectorAll<HTMLButtonElement>('.messages__option'));
    const destinations = () => options().map(option => option.querySelector('.messages__destination')?.textContent);
    return { fixture, host, options, destinations };
  };

  it('lists the requests of the customer that have an agent, and does not choose one for them', () => {
    const { host, options, destinations } = setUp([
      order(1), order(2, { agent: undefined }), order(3, { customer: 'noa' }), order(4, { status: 'cancelled' }), order(5, { destination: 'Rome', destinationId: 'paris' })
    ]);

    expect(destinations()).toEqual(['Rome', 'Place 1']);
    expect(options().some(option => option.getAttribute('aria-checked') === 'true')).toBe(false);
    expect(host.querySelector('message-thread')).toBeNull();
    expect(host.querySelector('.messages__hint')?.textContent).toContain('Select a request');
  });

  it('opens the conversation of the request that was selected', () => {
    const { fixture, host, options } = setUp([order(1), order(5, { destination: 'Rome', destinationId: 'paris' })]);

    options()[1].click();
    fixture.detectChanges();

    expect(options()[1].getAttribute('aria-checked')).toBe('true');
    expect(host.querySelector('.messages__heading')?.textContent).toContain('Place 1, with maya Cohen');
    expect(host.querySelector('message-thread')).not.toBeNull();
  });

  it('shows only the requests of the agent it was opened for', () => {
    const { destinations } = setUp([order(1), order(2, { agent: 'noa' })], { agentParam: 'noa' });

    expect(destinations()).toEqual(['Place 2']);
  });

  it('includes a booked trip, but not one whose number an open request uses', () => {
    const booked = { id: 9, order: order(9, { status: 'finished', destination: 'Rome', destinationId: 'paris' }) } as finalOrder;
    const reused = { id: 10, order: order(1, { destination: 'Madrid', destinationId: 'paris' }) } as finalOrder;
    const { destinations } = setUp([order(1)], { bookings: [booked, reused] });

    expect(destinations()).toEqual(['Rome', 'Place 1']);
  });

  it('explains when there is nobody to write to yet', () => {
    const { host } = setUp([order(1, { agent: undefined })]);

    expect(host.querySelector('.messages__empty')?.textContent).toContain('no conversation yet');
    expect(host.querySelector('.messages__empty a')?.getAttribute('href')).toBe('/homepage/book');
  });
});
