import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { Order, provideAppIcons } from '@vica-assist/shared';

import { OrderStore } from 'src/app/services/order/order.store';
import { UserRequestsPreviewModule } from '../user-requests-preview.module';
import { UserRequestPreviewComponent } from './user-request-preview.component';

const order = (id: number, destination: string): Order => ({
  id,
  orderID: `o-${id}`,
  choice: 'both',
  status: 'pending',
  departureDate: '2026-06-09',
  returnDate: '2026-06-16',
  origin: 'israel',
  destination,
  passDetails: [{ fullName: 'dana levi', passID: 123 }, { fullName: 'noa levi', passID: 456 }],
  stars: 4,
  priceRange: 500
});

const withWishes = (id: number): Order => ({
  ...order(id, 'oslo'),
  preferences: {
    flight: { stops: 'direct', checkedBaggage: true, cabin: 'business', departureTime: 'any', preferredAirlines: ['ly'], flexibleDays: 0 },
    hotel: { breakfast: true, bedType: 'king', freeCancellation: false, rooms: 1, area: 'any' },
    needs: { meal: 'vegan', seat: 'any', wheelchairAssistance: false },
    notes: 'Anniversary <b>trip</b>'
  }
});

describe('UserRequestPreviewComponent', () => {
  let fixture: ComponentFixture<UserRequestPreviewComponent>;
  const host = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UserRequestsPreviewModule],
      providers: [provideAppIcons()]
    }).compileComponents();

    patchState(unprotected(TestBed.inject(OrderStore)), { orders: [order(1, 'paris'), order(2, 'rome'), withWishes(3)] });
    fixture = TestBed.createComponent(UserRequestPreviewComponent);
  });

  it('shows only the requested order, with its route, dates, budget and travelers', () => {
    fixture.componentRef.setInput('orderID', 2);
    fixture.detectChanges();

    const text = host().textContent;
    expect(text).toContain('Order details');
    expect(text).toContain('rome');
    expect(text).not.toContain('paris');
    expect(text).toContain('9 Jun 2026');
    expect(text).toContain('$500.00');
    expect(host().querySelectorAll('.order-details__travelers li')).toHaveLength(2);
  });

  it('renders nothing when the order does not exist', () => {
    fixture.componentRef.setInput('orderID', 99);
    fixture.detectChanges();

    expect(host().querySelector('.order-details')).toBeNull();
  });

  it('shows what the customer asked for, and only that', () => {
    fixture.componentRef.setInput('orderID', 3);
    fixture.detectChanges();

    const text = host().textContent;
    expect(text).toContain('The customer asked for');
    expect(text).toContain('Direct only · Checked baggage · Business · Prefers El Al');
    expect(text).toContain('King bed · Breakfast included');
    expect(text).toContain('Vegan');
    expect(host().querySelector('.order-details__notes')?.textContent).toBe('Anniversary <b>trip</b>');
    expect(host().querySelector('.order-details__notes b')).toBeNull();
  });

  it('has no wishes section for an order without any', () => {
    fixture.componentRef.setInput('orderID', 2);
    fixture.detectChanges();

    expect(host().textContent).not.toContain('The customer asked for');
  });
});
