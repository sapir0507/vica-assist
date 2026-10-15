import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { API_URL, Order, provideAppIcons } from '@vica-assist/shared';

import { OrderStore } from 'src/app/services/order/order.store';
import { SessionStore } from 'src/app/services/session/session.store';
import { EditRequestComponent } from './edit-request.component';

const order = (overrides: Partial<Order> = {}): Order => ({
  id: 7, orderID: '7', choice: 'both', status: 'pending', departureDate: '2026-12-01', returnDate: '2026-12-08', origin: 'Tel Aviv', destination: 'Paris', destinationId: 'paris',
  passDetails: [{ fullName: 'Dana Levi', passID: 123456782 }], priceRange: 1000, customer: 'dana', ...overrides
});

describe('EditRequestComponent', () => {
  let fixture: ComponentFixture<EditRequestComponent>;
  const host = () => fixture.nativeElement as HTMLElement;

  const setUp = (orders: Order[] | undefined) => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EditRequestComponent],
      providers: [
        provideRouter([]),
        provideAppIcons(),
        { provide: API_URL, useValue: 'http://localhost:3000/' },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '7' }) } } }
      ]
    });
    patchState(unprotected(TestBed.inject(SessionStore)), { username: 'dana' });
    patchState(unprotected(TestBed.inject(OrderStore)), { orders });
    fixture = TestBed.createComponent(EditRequestComponent);
    fixture.detectChanges();
  };

  it('says it is loading until the orders have arrived', () => {
    setUp(undefined);

    expect(host().textContent).toContain('Loading your request');
  });

  it('opens the form with the customer\'s own pending request', () => {
    setUp([order()]);

    expect(host().querySelector('userRequests')).not.toBeNull();
    expect(host().textContent).toContain('Edit your request');
  });

  it('refuses a request that was answered, cancelled or belongs to someone else', () => {
    ['finished', 'cancelled'].forEach(status => {
      TestBed.resetTestingModule();
      setUp([order({ status })]);
      expect(host().querySelector('userRequests')).toBeNull();
      expect(host().textContent).toContain('cannot be changed any more');
    });

    TestBed.resetTestingModule();
    setUp([order({ customer: 'noa' })]);
    expect(host().querySelector('userRequests')).toBeNull();
  });

  it('goes back to the status page after saving', () => {
    setUp([order()]);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture.componentInstance.back();

    expect(navigate).toHaveBeenCalledWith(['/my-request', 7]);
  });
});
