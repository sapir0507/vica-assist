import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef } from '@angular/core';
import { API_URL, provideAppIcons, toDateInputValue } from '@vica-assist/shared';

import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';

import { OrderStore } from 'src/app/services/order/order.store';
import { SessionStore } from 'src/app/services/session/session.store';

import { UserRequestsModule } from '../user-requests.module';
import { UserRequestsComponent } from './user-requests.component';

const VALID_ID = '123456782';

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
    component.passDetails.at(0).patchValue({ fullName: 'Dana Levi', passID: VALID_ID });
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UserRequestsModule],
      providers: [provideAppIcons(), { provide: API_URL, useValue: 'http://localhost:3000/' }]
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
    const input = host().querySelector<HTMLInputElement>('place-field input') as HTMLInputElement;
    input.value = 'Lisbon';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.requestForm.value.destination).toBe('Lisbon');
    expect(host().querySelector('destination-card button[aria-checked="true"]')).toBeNull();
  });

  it('puts the place search above the cards', () => {
    const search = host().querySelector('place-field.booking__search') as HTMLElement;
    const picker = host().querySelector('.destination-picker') as HTMLElement;

    expect(search.compareDocumentPosition(picker) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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
      passDetails: [{ fullName: '  Dana   Levi ', passID: VALID_ID }],
      price: '900'
    });

    component.onSubmit();

    expect(addOrder).toHaveBeenCalledTimes(1);
    expect(addOrder.mock.calls[0][0]).toMatchObject({
      destination: 'Paris',
      origin: 'Tel Aviv',
      passDetails: [{ fullName: 'Dana Levi', passID: 123456782 }],
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
      passDetails: [{ fullName: 'Dana Levi', passID: VALID_ID }],
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

    it('rejects an ID with a wrong check digit, letters or the wrong length', () => {
      valid();

      ['123456789', '12345678a', '1234', '0'].forEach(id => {
        component.passDetails.at(0).patchValue({ passID: id });
        expect(component.passDetails.at(0).get('passID')?.hasError('israeliId')).toBe(true);
      });
    });

    it('rejects names that are one word, contain digits or are too long', () => {
      valid();

      ['Dana', 'Dana Levi3', 'D L', 'Dana ' + 'Levi'.repeat(20)].forEach(name => {
        component.passDetails.at(0).patchValue({ fullName: name });
        expect(component.passDetails.at(0).get('fullName')?.hasError('fullName')).toBe(true);
      });
    });

    it('rejects two travelers with the same ID', () => {
      valid();
      component.addNewPass();
      component.passDetails.at(1).patchValue({ fullName: 'Noa Levi', passID: VALID_ID });

      expect(component.passDetails.hasError('duplicateId')).toBe(true);
      expect(component.requestForm.valid).toBe(false);
    });

    it('stops adding travelers at the limit from the configuration', () => {
      for (let i = 0; i < 20; i++) component.addNewPass();

      expect(component.passDetails.length).toBe(9);
      expect(component.canAddTraveler).toBe(false);
    });

    it('rejects an origin or destination that is not a known country or city', () => {
      valid();
      component.requestForm.patchValue({ origin: 'Flat 5 Main Street' });
      expect(component.originControl.hasError('unknownPlace')).toBe(true);

      valid();
      component.requestForm.patchValue({ destination: 'Atlantis' });
      expect(component.destinationControl.hasError('unknownPlace')).toBe(true);

      valid();
      component.requestForm.patchValue({ origin: 'zurich', destination: 'SAO PAULO' });
      expect(component.requestForm.valid).toBe(true);
    });

    it('asks for the minimum hotel stars with the star picker, but not for a flight-only trip', () => {
      valid();
      component.step = 2;
      fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck();
      fixture.detectChanges();
      expect(host().querySelector('star-rating')).not.toBeNull();
      expect(host().querySelector('mat-select')).toBeNull();

      component.requestForm.patchValue({ order: 'flight' });
      fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck();
      fixture.detectChanges();
      expect(host().querySelector('star-rating')).toBeNull();
    });

    it('sends the stars for a hotel trip and leaves them out for a flight-only trip', () => {
      const addOrder = vi.spyOn(TestBed.inject(OrderStore), 'addOrder').mockReturnValue(undefined as never);
      valid();
      component.hotel.patchValue({ stars: 4 });
      component.onSubmit();
      expect(addOrder.mock.calls[0][0].stars).toBe(4);

      valid();
      component.requestForm.patchValue({ order: 'flight' });
      component.onSubmit();
      expect(addOrder.mock.calls[1][0].stars).toBeUndefined();
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
