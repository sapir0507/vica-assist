import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef } from '@angular/core';
import { provideAppIcons, toDateInputValue } from '@vica-assist/shared';

import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';

import { OrderStore } from 'src/app/services/order/order.store';
import { SessionStore } from 'src/app/services/session/session.store';

import { UserRequestsModule } from '../user-requests.module';
import { UserRequestsComponent } from './user-requests.component';

const daysFromToday = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date.toISOString());
};

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

  it('puts the search above the cards and suggests matching places as you type', () => {
    const search = host().querySelector('.booking__search') as HTMLElement;
    const picker = host().querySelector('.destination-picker') as HTMLElement;
    expect(search.compareDocumentPosition(picker) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    component.requestForm.patchValue({ destination: 'lis' });
    expect(component.suggestions).toEqual(['Lisbon']);

    component.requestForm.patchValue({ destination: 'ROM' });
    expect(component.suggestions).toContain('Rome');

    component.requestForm.patchValue({ destination: '' });
    expect(component.suggestions).toHaveLength(8);
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
    patchState(unprotected(TestBed.inject(SessionStore)), { username: 'dana' });
    const addOrder = vi.spyOn(TestBed.inject(OrderStore), 'addOrder').mockReturnValue(undefined as never);
    component.requestForm.patchValue({
      origin: ' Tel Aviv ',
      destination: 'Paris ',
      Dates: { departureDate: daysFromToday(5), returnDate: daysFromToday(12) },
      passDetails: [{ fullName: '  Dana Levi ', passID: '123' }],
      price: '900'
    });

    component.onSubmit();

    expect(addOrder).toHaveBeenCalledTimes(1);
    expect(addOrder.mock.calls[0][0]).toMatchObject({
      destination: 'Paris',
      origin: 'Tel Aviv',
      passDetails: [{ fullName: 'Dana Levi', passID: '123' }],
      choice: 'both',
      status: 'pending',
      customer: 'dana'
    });
    expect(Number.isNaN(Date.parse(addOrder.mock.calls[0][0].createdAt as string))).toBe(false);
    expect(component.step).toBe(0);
    expect(component.requestForm.value.destination).toBeNull();
    expect(component.requestForm.valid).toBe(false);
  });

  describe('validation', () => {
    const valid = () => component.requestForm.patchValue({
      origin: 'Tel Aviv',
      destination: 'Paris',
      Dates: { departureDate: daysFromToday(5), returnDate: daysFromToday(9) },
      passDetails: [{ fullName: 'Dana Levi', passID: '1' }],
      price: '500'
    });

    it('accepts a complete request', () => {
      valid();

      expect(component.requestForm.valid).toBe(true);
    });

    it('rejects a departure in the past but accepts today', () => {
      valid();
      component.Dates.patchValue({ departureDate: daysFromToday(-1), returnDate: daysFromToday(3) });
      expect(component.departureDate.hasError('pastDate')).toBe(true);
      expect(component.requestForm.valid).toBe(false);

      component.Dates.patchValue({ departureDate: daysFromToday(0) });
      expect(component.departureDate.hasError('pastDate')).toBe(false);
    });

    it('rejects a budget of zero or less', () => {
      valid();
      component.requestForm.patchValue({ price: '0' });
      expect(component.requestForm.valid).toBe(false);

      component.requestForm.patchValue({ price: '-5' });
      expect(component.requestForm.valid).toBe(false);
    });

    it('rejects blank text for the places and the traveler name', () => {
      valid();
      component.requestForm.patchValue({ origin: '   ' });
      expect(component.requestForm.controls['origin'].hasError('blank')).toBe(true);

      valid();
      component.requestForm.patchValue({ destination: ' ' });
      expect(component.requestForm.controls['destination'].hasError('blank')).toBe(true);

      valid();
      component.passDetails.at(0).patchValue({ fullName: '  ' });
      expect(component.passDetails.valid).toBe(false);
    });

    it('rejects an ID that is not a positive number', () => {
      valid();
      component.passDetails.at(0).patchValue({ passID: '0' });

      expect(component.passDetails.valid).toBe(false);
    });

    it('rejects the same origin and destination', () => {
      valid();
      component.requestForm.patchValue({ origin: 'paris', destination: 'Paris ' });

      expect(component.requestForm.hasError('samePlace')).toBe(true);
      expect(component.requestForm.valid).toBe(false);
    });

    it('does not send an invalid request', () => {
      const addOrder = vi.spyOn(TestBed.inject(OrderStore), 'addOrder').mockReturnValue(undefined as never);
      valid();
      component.requestForm.patchValue({ price: '0' });

      component.onSubmit();

      expect(addOrder).not.toHaveBeenCalled();
    });

    it('explains a past departure and the same place on the last step', () => {
      valid();
      component.requestForm.patchValue({ origin: 'Paris', destination: 'Paris' });
      component.Dates.patchValue({ departureDate: daysFromToday(-2), returnDate: daysFromToday(3) });
      component.departureDate.markAsDirty();
      component.step = 2;
      fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck();
      fixture.detectChanges();

      expect(host().textContent).toContain('The departure date cannot be in the past.');
      expect(host().textContent).toContain('The origin and the destination must be different.');
      expect(buttonLabelled('Submit request')?.disabled).toBe(true);
    });
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
