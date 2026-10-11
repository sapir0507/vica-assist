import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { API_URL, Order, provideAppIcons } from '@vica-assist/shared';

import { OrderStore } from 'src/app/services/order/order.store';
import { AgentHomepageComponent } from './agent-homepage.component';

const order = (id: number, status = 'pending'): Order => ({
  id,
  orderID: `${id}`,
  choice: 'both',
  status,
  departureDate: '2026-06-09',
  returnDate: '2026-06-16',
  origin: 'Israel',
  destination: 'Italy',
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
});
