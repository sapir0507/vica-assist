import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideAppIcons } from '@vica-assist/shared';

import { OrderStore } from 'src/app/services/order/order.store';

import { UserRequestsModule } from '../user-requests.module';
import { UserRequestsComponent } from './user-requests.component';

describe('UserRequestsComponent', () => {
  let component: UserRequestsComponent;
  let fixture: ComponentFixture<UserRequestsComponent>;
  const host = () => fixture.nativeElement as HTMLElement;
  const buttonLabelled = (label: string) =>
    Array.from(host().querySelectorAll<HTMLButtonElement>('button')).find(b => b.textContent?.includes(label));
  const click = (label: string) => {
    buttonLabelled(label)?.click();
    fixture.detectChanges();
  };
  const fillTraveler = () => {
    component.passDetails.at(0).patchValue({ fullName: 'Dana Levi', passID: '123' });
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UserRequestsModule],
      providers: [provideAppIcons()]
    }).compileComponents();

    fixture = TestBed.createComponent(UserRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('starts with the destination picker and a "1 of 3" indicator', () => {
    expect(host().querySelectorAll('destination-card')).toHaveLength(6);
    expect(host().textContent).toContain('Step 1 of 3');
  });

  it('fills the destination from a card and marks that card as selected', () => {
    const tokyo = host().querySelectorAll<HTMLButtonElement>('destination-card button')[1];
    tokyo.click();
    fixture.detectChanges();

    expect(component.requestForm.value.destination).toBe('Tokyo');
    expect(tokyo.getAttribute('aria-checked')).toBe('true');
  });

  it('accepts a typed destination too', () => {
    const input = host().querySelector<HTMLInputElement>('input[formcontrolname="destination"]') as HTMLInputElement;
    input.value = 'Lisbon';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.requestForm.value.destination).toBe('Lisbon');
    expect(host().querySelector('destination-card button[aria-checked="true"]')).toBeNull();
  });

  it('cannot continue without a destination or a complete traveler', () => {
    expect(buttonLabelled('Next')?.disabled).toBe(true);

    component.selectDestination(component.destinations[0]);
    fixture.detectChanges();
    expect(buttonLabelled('Next')?.disabled).toBe(false);

    click('Next');
    expect(host().textContent).toContain('Step 2 of 3');
    expect(buttonLabelled('Next')?.disabled).toBe(true);

    fillTraveler();
    expect(buttonLabelled('Next')?.disabled).toBe(false);
  });

  it('adds and removes travelers', () => {
    component.selectDestination(component.destinations[0]);
    fixture.detectChanges();
    click('Next');

    click('Add a traveler');
    expect(host().querySelectorAll('.traveler')).toHaveLength(2);

    click('Remove');
    expect(host().querySelectorAll('.traveler')).toHaveLength(1);
  });

  it('goes back a step without losing what was entered', () => {
    component.selectDestination(component.destinations[2]);
    fixture.detectChanges();
    click('Next');
    click('Back');

    expect(host().textContent).toContain('Step 1 of 3');
    expect(component.requestForm.value.destination).toBe('Bali');
  });

  it('sends the order once and starts over, so it cannot be submitted twice', () => {
    const addOrder = vi.spyOn(TestBed.inject(OrderStore), 'addOrder').mockReturnValue(undefined as never);
    component.requestForm.patchValue({
      origin: 'Tel Aviv',
      destination: 'Paris',
      Dates: { departureDate: '2026-06-10', returnDate: '2026-06-17' },
      passDetails: [{ fullName: 'Dana Levi', passID: '123' }]
    });

    component.onSubmit();

    expect(addOrder).toHaveBeenCalledTimes(1);
    expect(addOrder.mock.calls[0][0]).toMatchObject({ destination: 'Paris', origin: 'Tel Aviv', choice: 'both', status: 'pending' });
    expect(component.step).toBe(0);
    expect(component.requestForm.value.destination).toBeNull();
    expect(component.requestForm.valid).toBe(false);
  });

  it('rejects a return date before the departure date', () => {
    component.Dates.patchValue({ departureDate: '2026-06-10', returnDate: '2026-06-09' });

    expect(component.Dates.hasError('dateRange')).toBe(true);
    expect(component.requestForm.valid).toBe(false);
  });

  it('accepts a return on or after the departure date', () => {
    component.Dates.patchValue({ departureDate: '2026-06-10', returnDate: '2026-06-10' });

    expect(component.Dates.hasError('dateRange')).toBe(false);
  });
});
