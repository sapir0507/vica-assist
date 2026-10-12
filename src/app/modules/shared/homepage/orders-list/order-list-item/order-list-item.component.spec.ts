import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Order, provideAppIcons } from '@vica-assist/shared';

import { OrderListItemComponent } from './order-list-item.component';

const order: Order = {
  id: 7,
  orderID: 'o-7',
  choice: 'both',
  status: 'pending',
  departureDate: '2026-06-09T12:00:00.000Z',
  returnDate: '2026-06-16T12:00:00.000Z',
  origin: 'Israel',
  destination: 'Italy',
  passDetails: [{ fullName: 'Jane Doe', passID: 12345678 }],
  priceRange: 500
};

describe('OrderListItemComponent', () => {
  let fixture: ComponentFixture<OrderListItemComponent>;
  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderListItemComponent],
      providers: [provideAppIcons(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListItemComponent);
  });

  it('renders nothing without an order', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.order-card')).toBeNull();
  });

  it('shows the order, its status, route and dates', () => {
    fixture.componentRef.setInput('currentItem', order);
    fixture.detectChanges();

    expect(text()).toContain('Order 7');
    expect(text()).toContain('Request number: VA-000007');
    expect(text()).toContain('Jane Doe');
    expect(text()).toContain('Israel → Italy');
    expect(text()).toContain('9 Jun 2026');
    expect(text()).toContain('16 Jun 2026');
    expect(fixture.nativeElement.querySelector('.chip--pending')?.textContent).toContain('pending');
  });

  it('renders the action as a Material button, not a bare browser button', () => {
    fixture.componentRef.setInput('currentItem', order);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button')?.classList).toContain('mat-mdc-raised-button');
  });

  it('emits the order when Open order is clicked', () => {
    const opened: Order[] = [];
    fixture.componentInstance.item.subscribe(o => opened.push(o));
    fixture.componentRef.setInput('currentItem', order);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    expect(opened).toEqual([order]);
  });

  it('offers a link to the status page when asked to', () => {
    fixture.componentRef.setInput('currentItem', order);
    fixture.componentRef.setInput('trackLink', true);
    fixture.detectChanges();

    const link = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>('a');
    expect(link?.textContent).toContain('Track status');
    expect(link?.getAttribute('href')).toBe('/my-request/7');
  });

  it('has no status link by default', () => {
    fixture.componentRef.setInput('currentItem', order);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('a')).toBeNull();
  });
});
