import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { Order, provideAppIcons } from '@vica-assist/shared';

import { OrderStore } from 'src/app/services/order/order.store';
import { OrdersListComponent } from './orders-list.component';

const order = (id: number, status: string): Order => ({
  id,
  orderID: `o-${id}`,
  choice: 'flight',
  status,
  departureDate: '2026-06-09T12:00:00.000Z',
  returnDate: '2026-06-16T12:00:00.000Z',
  origin: 'Israel',
  destination: 'Italy', destinationId: 'paris',
  passDetails: [{ fullName: 'Jane Doe', passID: 12345678 }],
  priceRange: 500
});

describe('OrdersListComponent', () => {
  let fixture: ComponentFixture<OrdersListComponent>;
  const host = () => fixture.nativeElement as HTMLElement;
  const button = () => host().querySelector('button') as HTMLButtonElement | null;

  const show = (status: string, viewer: 'agent' | 'customer') => {
    patchState(unprotected(TestBed.inject(OrderStore)), { orders: [order(1, status), order(2, 'pending')] });
    fixture.componentRef.setInput('requestID', 1);
    fixture.componentRef.setInput('status', viewer);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, OrdersListComponent],
      providers: [provideAppIcons()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersListComponent);
  });

  it('shows only the order whose id is requested', () => {
    show('pending', 'agent');

    expect(host().querySelectorAll('.order-card')).toHaveLength(1);
    expect(host().textContent).toContain('Order 1');
    expect(host().textContent).not.toContain('Order 2');
  });

  it('lets an agent open a pending order', () => {
    const opened: Order[] = [];
    fixture.componentInstance.item.subscribe(o => opened.push(o));
    show('pending', 'agent');

    button()?.click();

    expect(button()?.textContent).toContain('Open order');
    expect(opened.map(o => o.id)).toEqual([1]);
  });

  it('shows an agent a disabled "Finished" button for a finished order', () => {
    show('finished', 'agent');

    expect(button()?.disabled).toBe(true);
    expect(button()?.textContent).toContain('Finished');
  });

  it('lets a customer open a finished order but not a pending one', () => {
    show('finished', 'customer');
    expect(button()?.textContent).toContain('Open order');

    show('pending', 'customer');
    expect(button()).toBeNull();
  });
});
