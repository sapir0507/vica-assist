import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { of } from 'rxjs';
import { API_URL, Agent, Order, provideAppIcons } from '@vica-assist/shared';

import { AgentStore } from 'src/app/services/agent/agent.store';
import { OrderStore } from 'src/app/services/order/order.store';
import { SessionStore } from 'src/app/services/session/session.store';
import { AgentHomepageComponent } from './agent-homepage.component';

const order = (id: number, status = 'pending'): Order => ({
  id,
  orderID: `${id}`,
  choice: 'both',
  status,
  departureDate: '2026-06-09',
  returnDate: '2026-06-16',
  origin: 'Israel',
  destination: 'Italy', destinationId: 'paris',
  passDetails: [{ fullName: 'Jane Doe', passID: 1 }],
  priceRange: 500
});

describe('AgentHomepageComponent', () => {
  let component: AgentHomepageComponent;
  let fixture: ComponentFixture<AgentHomepageComponent>;
  const host = () => fixture.nativeElement as HTMLElement;
  const button = (label: string) =>
    Array.from(host().querySelectorAll<HTMLButtonElement>('button')).find(b => b.textContent?.includes(label));
  const arrow = (name: 'Previous' | 'Next') =>
    host().querySelector<HTMLButtonElement>(`[aria-label="${name} request"]`);

  const refresh = () => {
    fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();
  };
  const withOrders = (...orders: Order[]) => {
    patchState(unprotected(TestBed.inject(OrderStore)), {
      orders,
      pendingOrders: orders.filter(o => o.status === 'pending'),
      finishedOrders: orders.filter(o => o.status === 'finished')
    });
    refresh();
  };
  const click = (target: HTMLElement | null | undefined) => {
    target?.click();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AgentHomepageComponent],
      providers: [{ provide: API_URL, useValue: 'http://localhost:3000/' }, provideAppIcons()],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AgentHomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('starts on the requests and counts the pending ones in the switch', () => {
    withOrders(order(2), order(3), order(4, 'finished'));

    expect(button('Requests')?.textContent).toContain('(2)');
    expect(button('Requests')?.getAttribute('aria-pressed')).toBe('true');
    expect(host().querySelector('agent-insights')).toBeNull();
  });

  it('switches to the insights and back', async () => {
    withOrders(order(2));

    click(button('Insights'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host().querySelector('agent-insights')).not.toBeNull();
    expect(host().querySelector('ordersList')).toBeNull();

    click(button('Requests'));
    expect(host().querySelector('ordersList')).not.toBeNull();
  });

  it('says so when no request is waiting', () => {
    withOrders(order(1, 'finished'));

    expect(host().textContent).toContain('No pending requests.');
    expect(host().querySelector('ordersList')).toBeNull();
  });

  it('queues only the pending requests', () => {
    withOrders(order(1, 'finished'), order(2), order(3));

    expect(host().textContent).toContain('Request 1 of 2');
    expect(host().querySelector('ordersList')).not.toBeNull();
    expect(component.current?.id).toBe(2);
  });

  it('does not step past the first or the last request', () => {
    withOrders(order(2), order(3));
    expect(arrow('Previous')?.disabled).toBe(true);

    click(arrow('Next'));

    expect(host().textContent).toContain('Request 2 of 2');
    expect(arrow('Next')?.disabled).toBe(true);
  });

  it('shows the flight and hotel forms only once a request is opened', () => {
    withOrders(order(2));
    expect(host().querySelector('.workspace')).toBeNull();

    component.onChosen2(order(2));
    refresh();

    expect(host().querySelector('lib-myFlights')).not.toBeNull();
    expect(host().querySelector('my-hotels')).toBeNull();
  });

  it('switches between the flight and hotel forms', () => {
    withOrders(order(2));
    component.onChosen2(order(2));
    refresh();

    click(button('Hotels'));

    expect(host().querySelector('my-hotels')).not.toBeNull();
    expect(host().querySelector('lib-myFlights')).toBeNull();
    expect(button('Hotels')?.getAttribute('aria-pressed')).toBe('true');
  });

  it('closes the workspace when the agent moves to another request', () => {
    withOrders(order(2), order(3));
    component.onChosen2(order(2));
    refresh();

    click(arrow('Next'));

    expect(host().querySelector('.workspace')).toBeNull();
    expect(component.current?.id).toBe(3);
  });

  it('marks the opened request as finished and closes it', () => {
    withOrders(order(2));
    const update = vi.spyOn(TestBed.inject(OrderStore), 'updateStatusByOrderID').mockReturnValue(undefined);
    component.onChosen2(order(2));
    refresh();

    click(button('Set order as finished'));

    expect(update).toHaveBeenCalledWith('2', 'finished');
    expect(host().querySelector('.workspace')).toBeNull();
  });

  describe('agents and their own requests', () => {
    const agentProfile = (username: string, available = true): Agent => ({
      id: username === 'dana' ? 1 : 2, username, displayName: username, title: '', bio: '', languages: [], specialties: [], yearsExperience: 1, email: '', available, active: true
    });
    const signIn = (username: string) => patchState(unprotected(TestBed.inject(SessionStore)), { username });
    const withAgents = (...agents: Agent[]) => {
      patchState(unprotected(TestBed.inject(AgentStore)), { agents });
      refresh();
    };

    it('queues only the signed-in agent\'s requests and the ones nobody was given', () => {
      signIn('dana');
      withOrders({ ...order(1), agent: 'dana' }, { ...order(2), agent: 'noa' }, order(3));

      expect(component.pending.map(o => o.id)).toEqual([1, 3]);
      expect(host().textContent).toContain('Request 1 of 2');
      expect(button('Requests')?.textContent).toContain('(2)');
    });

    it('shows an availability switch to an agent with a profile, and none to anyone else', () => {
      signIn('dana');
      withAgents(agentProfile('dana'));
      expect(host().querySelector('.availability')?.textContent).toContain('Available for new requests');

      signIn('someone-else');
      refresh();
      expect(host().querySelector('.availability')).toBeNull();
    });

    it('turns availability off, saves it and hands the pending requests to someone else', () => {
      signIn('dana');
      const setAvailability = vi.spyOn(TestBed.inject(AgentStore), 'setAvailability').mockImplementation((username, available) => {
        patchState(unprotected(TestBed.inject(AgentStore)), { agents: [agentProfile('dana', available), agentProfile('noa')] });
        return of(agentProfile(username, available));
      });
      const reassign = vi.spyOn(TestBed.inject(OrderStore), 'reassign').mockReturnValue(undefined);
      withAgents(agentProfile('dana'), agentProfile('noa'));
      withOrders({ ...order(1), agent: 'dana', createdAt: new Date().toISOString() });
      reassign.mockClear();

      const toggle = host().querySelector<HTMLInputElement>('.availability input') as HTMLInputElement;
      toggle.checked = false;
      toggle.dispatchEvent(new Event('change'));

      expect(setAvailability).toHaveBeenCalledWith('dana', false);
      expect(reassign).toHaveBeenCalledWith([{ orderId: 1, from: 'dana', to: 'noa', reason: 'agent-unavailable' }]);
    });

    it('does not hand anything over when the agent comes back', () => {
      signIn('dana');
      vi.spyOn(TestBed.inject(AgentStore), 'setAvailability').mockReturnValue(of(agentProfile('dana')));
      const reassign = vi.spyOn(TestBed.inject(OrderStore), 'reassign').mockReturnValue(undefined);
      withAgents(agentProfile('dana', false), agentProfile('noa'));
      reassign.mockClear();

      component.setAvailability(true);

      expect(reassign).not.toHaveBeenCalled();
    });

    it('hands over requests that are overdue when the dashboard opens, once', () => {
      signIn('dana');
      const reassign = vi.spyOn(TestBed.inject(OrderStore), 'reassign').mockReturnValue(undefined);
      const late = { ...order(1), agent: 'dana', createdAt: new Date(Date.now() - 48 * 3_600_000).toISOString() };

      patchState(unprotected(TestBed.inject(AgentStore)), { agents: [agentProfile('dana'), agentProfile('noa')] });
      withOrders(late);
      withOrders(late, order(2));

      expect(reassign).toHaveBeenCalledTimes(1);
      expect(reassign).toHaveBeenCalledWith([{ orderId: 1, from: 'dana', to: 'noa', reason: 'overdue' }]);
    });
  });

  it('shows the conversation with the customer once a request is opened, written as the signed-in agent', () => {
    patchState(unprotected(TestBed.inject(SessionStore)), { username: 'dana' });
    withOrders({ ...order(2), agent: 'dana' });
    expect(host().querySelector('message-thread')).toBeNull();

    component.onChosen2(order(2));
    refresh();

    expect(host().querySelector('message-thread')).not.toBeNull();
  });
});
