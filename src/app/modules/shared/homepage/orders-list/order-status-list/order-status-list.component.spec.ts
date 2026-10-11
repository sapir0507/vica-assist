import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { API_URL, Order, provideAppIcons } from '@vica-assist/shared';

import { FinalOrderStore } from 'src/app/services/finalOrder/finalOrder.store';
import { OrderStore } from 'src/app/services/order/order.store';
import { SessionStore } from 'src/app/services/session/session.store';
import { OrderStatusListComponent } from './order-status-list.component';

const order = (id: number, status: string, customer = 'dana'): Order => ({
  id,
  customer,
  orderID: `o-${id}`,
  choice: 'hotel',
  status,
  departureDate: '2026-06-09T12:00:00.000Z',
  returnDate: '2026-06-16T12:00:00.000Z',
  origin: 'Israel',
  destination: 'Italy',
  passDetails: [{ fullName: 'Jane Doe', passID: 12345678 }],
  priceRange: 500
});

describe('OrderStatusListComponent', () => {
  let fixture: ComponentFixture<OrderStatusListComponent>;
  const host = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: API_URL, useValue: 'http://localhost:3000/' }, provideAppIcons()],
      imports: [HttpClientTestingModule, OrderStatusListComponent]
    }).compileComponents();

    patchState(unprotected(TestBed.inject(SessionStore)), { username: 'dana' });
    patchState(unprotected(TestBed.inject(OrderStore)), {
      pendingOrders: [order(1, 'pending'), order(2, 'pending')],
      finishedOrders: []
    });
    fixture = TestBed.createComponent(OrderStatusListComponent);
  });

  it('shows one card per order with that status', () => {
    fixture.componentRef.setInput('status', 'pending');
    fixture.detectChanges();

    expect(host().querySelectorAll('order-list-item')).toHaveLength(2);
  });

  it('shows a customer only their own orders', () => {
    patchState(unprotected(TestBed.inject(OrderStore)), {
      pendingOrders: [order(1, 'pending'), order(2, 'pending', 'noa'), { ...order(3, 'pending'), customer: undefined }]
    });
    fixture.componentRef.setInput('status', 'pending');
    fixture.detectChanges();

    expect(host().querySelectorAll('order-list-item')).toHaveLength(1);
    expect(host().textContent).toContain('Order 1');
  });

  it('says so when there are no orders with that status', () => {
    fixture.componentRef.setInput('status', 'finished');
    fixture.detectChanges();

    expect(host().textContent).toContain('No agent answers to choose from yet.');
  });

  it('remembers the opened order for the final-order flow and re-emits it', () => {
    const opened: Order[] = [];
    fixture.componentInstance.item.subscribe(o => opened.push(o));
    fixture.componentRef.setInput('status', 'pending');
    fixture.detectChanges();

    (host().querySelector('button') as HTMLButtonElement).click();

    expect(opened.map(o => o.id)).toEqual([1]);
    expect(TestBed.inject(FinalOrderStore).order()?.id).toBe(1);
  });
});
