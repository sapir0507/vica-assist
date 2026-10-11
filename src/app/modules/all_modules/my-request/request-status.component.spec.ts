import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { of, throwError } from 'rxjs';
import { API_URL, Agent, finalOrder, Order, provideAppIcons } from '@vica-assist/shared';

import { AgentStore } from 'src/app/services/agent/agent.store';
import { BookingStore } from 'src/app/services/booking/booking.store';
import { FinalOrderStore } from 'src/app/services/finalOrder/finalOrder.store';
import { OrderStore } from 'src/app/services/order/order.store';
import { SessionStore } from 'src/app/services/session/session.store';
import { RequestStatusComponent } from './request-status.component';

const agent: Agent = {
  id: 1, username: 'maya', displayName: 'Maya Cohen', title: 'Senior travel agent', bio: 'Knows Europe well.',
  languages: ['Hebrew', 'English'], specialties: ['Paris'], yearsExperience: 9, email: 'maya@example.com', available: true, active: true
};

const order = (overrides: Partial<Order> = {}): Order => ({
  id: 7,
  orderID: '7',
  choice: 'both',
  status: 'pending',
  departureDate: '2026-12-01',
  returnDate: '2026-12-08',
  origin: 'tel aviv',
  destination: 'paris',
  passDetails: [{ fullName: 'Dana Levi', passID: 123456782 }],
  priceRange: 1500,
  stars: 4,
  customer: 'dana',
  agent: 'maya',
  createdAt: '2026-10-01T09:00:00.000Z',
  assignedAt: '2026-10-01T09:00:01.000Z',
  preferences: { flight: { stops: 'direct', checkedBaggage: true, cabin: 'economy', departureTime: 'any', preferredAirlines: [], flexibleDays: 0 }, notes: 'Quiet seats' },
  ...overrides
});

describe('RequestStatusComponent', () => {
  let fixture: ComponentFixture<RequestStatusComponent>;
  const host = () => fixture.nativeElement as HTMLElement;
  const text = () => host().textContent?.replace(/\s+/g, ' ') ?? '';
  const button = (label: string) =>
    Array.from(host().querySelectorAll<HTMLElement>('button, a')).find(b => b.textContent?.includes(label));

  const setUp = (orders: Order[] | undefined, bookings: finalOrder[] | undefined = [], id = '7') => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RequestStatusComponent],
      providers: [
        provideRouter([]),
        provideAppIcons(),
        { provide: API_URL, useValue: 'http://localhost:3000/' },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id }) } } }
      ]
    });
    patchState(unprotected(TestBed.inject(SessionStore)), { username: 'dana' });
    patchState(unprotected(TestBed.inject(OrderStore)), { orders });
    patchState(unprotected(TestBed.inject(BookingStore)), { bookings });
    patchState(unprotected(TestBed.inject(AgentStore)), { agents: [agent] });
    vi.spyOn(TestBed.inject(OrderStore), 'runReassignments').mockReturnValue(undefined);
    fixture = TestBed.createComponent(RequestStatusComponent);
    fixture.detectChanges();
  };

  it('says it is loading until the orders and bookings have arrived', () => {
    setUp(undefined);

    expect(text()).toContain('Loading your request');
  });

  it('does not reveal another customer\'s request, or one that does not exist', () => {
    setUp([order({ customer: 'noa' })]);
    expect(text()).toContain('We could not find this request');
    expect(text()).not.toContain('Dana Levi');
  });

  it('says so for an unknown id', () => {
    setUp([order()], [], '99');

    expect(text()).toContain('We could not find this request');
  });

  describe('a request waiting for its agent', () => {
    beforeEach(() => setUp([order()]));

    it('shows the destination, reference, dates and status', () => {
      expect(text()).toContain('Your request to Paris');
      expect(text()).toContain('Reference 7');
      expect(text()).toContain('1 Dec 2026');
      expect(host().querySelector('.status__chip')?.textContent).toContain('Waiting for your agent');
    });

    it('shows the timeline with the next step marked', () => {
      const current = host().querySelector('.timeline__step--current');

      expect(host().querySelectorAll('.timeline__step')).toHaveLength(5);
      expect(current?.textContent).toContain('Options added');
      expect(current?.getAttribute('aria-current')).toBe('step');
    });

    it('explains what happens next, with the promised time from the configuration', () => {
      expect(text()).toContain('Maya Cohen is reading your request');
      expect(text()).toContain('within 24 hours');
    });

    it('introduces the agent, with a way to write to them', () => {
      expect(text()).toContain('Maya Cohen');
      expect(text()).toContain('Senior travel agent');
      expect(text()).toContain('9 years');
      expect(text()).toContain('Hebrew, English');
      expect(text()).toContain('No reviews yet');
      expect(host().querySelector<HTMLAnchorElement>('.agent__mail')?.getAttribute('href')).toBe('mailto:maya@example.com');
      expect(host().querySelector('message-thread')).not.toBeNull();
    });

    it('summarises the request including what the customer asked for', () => {
      expect(text()).toContain('Direct only');
      expect(text()).toContain('Checked baggage');
      expect(text()).toContain('Quiet seats');
      expect(text()).toContain('At least 4');
    });

    it('offers to edit and cancel, but not to choose', () => {
      expect(button('Edit request')?.getAttribute('href')).toBe('/my-request/7/edit');
      expect(button('Cancel request')).toBeDefined();
      expect(button('Choose your hotel and flight')).toBeUndefined();
    });

    it('asks to confirm before cancelling, and can be told to keep the request', () => {
      const cancel = vi.spyOn(TestBed.inject(OrderStore), 'cancel').mockReturnValue(of({} as Order));

      button('Cancel request')?.click();
      fixture.detectChanges();
      expect(text()).toContain('Cancel this request?');
      expect(cancel).not.toHaveBeenCalled();

      button('Keep it')?.click();
      fixture.detectChanges();
      expect(text()).not.toContain('Cancel this request?');

      button('Cancel request')?.click();
      fixture.detectChanges();
      button('Yes, cancel it')?.click();
      expect(cancel).toHaveBeenCalledWith(7);
    });

    it('shows why a request could not be cancelled', () => {
      vi.spyOn(TestBed.inject(OrderStore), 'cancel').mockReturnValue(throwError(() => new Error('Too late.')));

      button('Cancel request')?.click();
      fixture.detectChanges();
      button('Yes, cancel it')?.click();
      fixture.detectChanges();

      expect(host().querySelector('[role="alert"]')?.textContent).toContain('Too late.');
    });

    it('refreshes the status on request', () => {
      const getAll = vi.spyOn(TestBed.inject(OrderStore), 'getAll');

      button('Refresh status')?.click();

      expect(getAll).toHaveBeenCalled();
    });
  });

  it('shows the rating of an agent who has been reviewed', () => {
    const reviewed: finalOrder = { id: 1, order: order({ id: 1, status: 'finished', customer: 'someone', agent: 'maya' }), feedback: { hotelRating: 5, flightRating: 4, ratedAt: 'x' } };
    setUp([order()], [reviewed]);

    expect(text()).toContain('4.5 from 1 review, 100% pleased');
  });

  it('tells a customer without an agent yet that one is coming', () => {
    setUp([order({ agent: undefined, assignedAt: undefined })]);

    expect(text()).toContain('An agent will be assigned to your request shortly');
    expect(host().querySelector('message-thread')).toBeNull();
  });

  it('explains a move to another agent', () => {
    setUp([order({ assignments: [{ agent: 'noa', at: 'a', reason: 'initial' }, { agent: 'maya', at: 'b', reason: 'overdue' }] })]);

    expect(host().querySelector('.status__note')?.textContent).toContain('moved to Maya Cohen because it was not answered within 24 hours');
  });

  describe('a request the agent has answered', () => {
    beforeEach(() => setUp([order({ status: 'finished', respondedAt: '2026-10-02T10:00:00.000Z' })]));

    it('invites the customer to choose, and says the options are ready', () => {
      expect(host().querySelector('.status__chip')?.textContent).toContain('Ready for you to choose');
      expect(text()).toContain('Maya Cohen has added options for you');
      expect(host().querySelector('offer-summary')).not.toBeNull();
      expect(button('Edit request')).toBeUndefined();
      expect(button('Cancel request')).toBeUndefined();
    });

    it('opens the choice page with this request', () => {
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

      button('Choose your hotel and flight')?.click();

      expect(TestBed.inject(FinalOrderStore).order()?.id).toBe(7);
      expect(navigate).toHaveBeenCalledWith(['/final-order', 7]);
    });
  });

  describe('a booked trip', () => {
    const booked = (returnDate: string, feedback?: finalOrder['feedback']): finalOrder => ({
      id: 1, order: order({ status: 'finished', returnDate }), bookedAt: '2026-10-03T08:00:00.000Z', feedback
    });

    it('is found through its booking even though the order itself is gone', () => {
      setUp([], [booked('2999-01-01')]);

      expect(host().querySelector('.status__chip')?.textContent).toContain('Booked');
      expect(host().querySelector('.timeline__step--current')?.textContent).toContain('Booked');
      expect(button('Edit request')).toBeUndefined();
      expect(button('Cancel request')).toBeUndefined();
      expect(button('Rate your trip')).toBeUndefined();
    });

    it('invites a rating once the trip is over', () => {
      setUp([], [booked('2020-01-01')]);

      expect(text()).toContain('We hope you had a good trip');
      expect(button('Rate your trip')?.getAttribute('href')).toBe('/homepage');
    });

    it('does not ask again when the trip was rated', () => {
      setUp([], [booked('2020-01-01', { hotelRating: 5, ratedAt: 'x' })]);

      expect(button('Rate your trip')).toBeUndefined();
    });
  });

  it('shows a cancelled request without actions or messages', () => {
    setUp([order({ status: 'cancelled', cancelledAt: '2026-10-01T12:00:00.000Z' })]);

    expect(host().querySelector('.status__chip')?.textContent).toContain('Cancelled');
    expect(text()).toContain('Nothing was booked');
    expect(button('Edit request')).toBeUndefined();
    expect(host().querySelector('message-thread')).toBeNull();
  });

  it('hands over overdue requests once the orders and agents are loaded', () => {
    setUp([order()]);

    expect(TestBed.inject(OrderStore).runReassignments).toHaveBeenCalledTimes(1);
  });

  it('writes initials for the avatar', () => {
    setUp([order()]);

    expect(host().querySelector('.agent__avatar')?.textContent).toBe('MC');
  });
});
