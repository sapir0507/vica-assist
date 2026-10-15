import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { API_URL, Agent, Message, Order, provideAppIcons, toDateInputValue } from '@vica-assist/shared';

import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';

import { DESTINATIONS } from 'src/app/modules/shared/destinations/destinations.testing';
import { DestinationStore } from 'src/app/services/destination/destination.store';
import { OrderStore } from 'src/app/services/order/order.store';
import { AgentStore } from 'src/app/services/agent/agent.store';
import { MessageStore } from 'src/app/services/message/message.store';
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
  const chooseCard = (index: number) => {
    host().querySelectorAll<HTMLButtonElement>('destination-card button')[index].click();
    fixture.detectChanges();
  };
  const fillTraveler = () => {
    component.passDetails.at(0).patchValue({ fullName: 'Dana Levi', passID: VALID_ID });
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UserRequestsModule],
      providers: [provideAppIcons(), provideRouter([]), { provide: API_URL, useValue: 'http://localhost:3000/' }]
    }).compileComponents();

    patchState(unprotected(TestBed.inject(DestinationStore)), { destinations: [...DESTINATIONS] });
    fixture = TestBed.createComponent(UserRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('starts with the destination picker and a "1 of 4" indicator', () => {
    expect(host().querySelectorAll('destination-card')).toHaveLength(6);
    expect(host().textContent).toContain('Step 1 of 4');
  });

  it('fills the destination from a card and marks that card as selected', () => {
    const tokyo = host().querySelectorAll<HTMLButtonElement>('destination-card button')[1];
    tokyo.click();
    fixture.detectChanges();

    expect(component.requestForm.value).toMatchObject({ destinationId: 'tokyo', destination: 'Tokyo' });
    expect(tokyo.getAttribute('aria-checked')).toBe('true');
  });

  it('only offers the destinations we know, with no free text', () => {
    expect(host().querySelector('place-field')).toBeNull();
    expect(Array.from(host().querySelectorAll('destination-card')).map(card => card.textContent)).toEqual(
      DESTINATIONS.map(place => expect.stringContaining(place.name))
    );
  });

  it('leaves out a destination that is no longer offered', () => {
    patchState(unprotected(TestBed.inject(DestinationStore)), { destinations: DESTINATIONS.map(place => ({ ...place, active: place.id !== 'bali' })) });
    fixture.detectChanges();

    expect(host().querySelectorAll('destination-card')).toHaveLength(5);
  });

  it('cannot continue without a destination or a complete traveler', () => {
    expect(buttonLabelled('Next')?.disabled).toBe(true);

    chooseCard(0);
    expect(buttonLabelled('Next')?.disabled).toBe(false);

    click('Next');
    expect(host().textContent).toContain('Step 2 of 4');
    expect(buttonLabelled('Next')?.disabled).toBe(true);

    fillTraveler();
    expect(buttonLabelled('Next')?.disabled).toBe(false);
  });

  it('adds and removes travelers', () => {
    chooseCard(0);
    click('Next');

    click('Add a traveler');
    expect(host().querySelectorAll('.traveler')).toHaveLength(2);

    click('Remove');
    expect(host().querySelectorAll('.traveler')).toHaveLength(1);
  });

  it('goes back a step without losing what was entered', () => {
    chooseCard(2);
    click('Next');
    click('Back');

    expect(host().textContent).toContain('Step 1 of 4');
    expect(component.requestForm.value.destination).toBe('Bali');
  });

  it('sends the order once and starts over, so it cannot be submitted twice', () => {
    patchState(unprotected(TestBed.inject(SessionStore)), { username: 'dana' });
    const addOrder = vi.spyOn(TestBed.inject(OrderStore), 'addOrder').mockReturnValue(of({} as Order));
    component.requestForm.patchValue({
      origin: ' Tel Aviv ',
      destination: 'Paris ', destinationId: 'paris',
      Dates: { departureDate: daysFromToday(5), returnDate: daysFromToday(12) },
      passDetails: [{ fullName: '  Dana   Levi ', passID: VALID_ID }],
      price: '900'
    });

    component.onSubmit();

    expect(addOrder).toHaveBeenCalledTimes(1);
    expect(addOrder.mock.calls[0][0]).toMatchObject({
      destination: 'Paris', destinationId: 'paris',
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
      destination: 'Paris', destinationId: 'paris',
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

    it('rejects a blank origin and a blank traveler name', () => {
      valid();
      component.requestForm.patchValue({ origin: '   ' });
      expect(component.requestForm.controls['origin'].hasError('blank')).toBe(true);

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

    it('rejects an origin that is not a known country or city, and needs a destination to be picked', () => {
      valid();
      component.requestForm.patchValue({ origin: 'Flat 5 Main Street' });
      expect(component.originControl.hasError('unknownPlace')).toBe(true);

      valid();
      component.requestForm.patchValue({ destinationId: '' });
      expect(component.requestForm.valid).toBe(false);

      valid();
      component.requestForm.patchValue({ origin: 'zurich' });
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
      const addOrder = vi.spyOn(TestBed.inject(OrderStore), 'addOrder').mockReturnValue(of({} as Order));
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
      component.requestForm.patchValue({ origin: 'paris', destination: 'Paris ', destinationId: 'paris' });

      expect(component.requestForm.hasError('samePlace')).toBe(true);
      expect(component.requestForm.valid).toBe(false);
    });

    it('does not send an invalid request', () => {
      const addOrder = vi.spyOn(TestBed.inject(OrderStore), 'addOrder').mockReturnValue(of({} as Order));
      valid();
      component.requestForm.patchValue({ price: '0' });

      component.onSubmit();

      expect(addOrder).not.toHaveBeenCalled();
    });

    it('explains a past departure and the same place on the last step', () => {
      valid();
      component.requestForm.patchValue({ origin: 'Paris', destination: 'Paris', destinationId: 'paris' });
      component.Dates.patchValue({ departureDate: daysFromToday(-2), returnDate: daysFromToday(3) });
      component.departureDate.markAsDirty();
      component.step = 2;
      fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck();
      fixture.detectChanges();

      expect(host().textContent).toContain('The departure date cannot be in the past.');
      expect(host().textContent).toContain('The origin and the destination must be different.');
      expect(buttonLabelled('Next')?.disabled).toBe(true);
    });

    describe('preferences step', () => {
      const showPreferences = () => {
        component.step = 3;
        fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck();
        fixture.detectChanges();
      };

      it('offers flight, hotel and needs sections for a flight and hotel trip, all optional', () => {
        valid();
        showPreferences();

        expect(Array.from(host().querySelectorAll('legend')).map(l => l.textContent)).toEqual(['Flight', 'Hotel', 'Travel needs']);
        expect(buttonLabelled('Submit request')?.disabled).toBe(false);
      });

      it('offers only what the trip type needs', () => {
        valid();
        component.requestForm.patchValue({ order: 'flight' });
        showPreferences();
        expect(Array.from(host().querySelectorAll('legend')).map(l => l.textContent)).toEqual(['Flight', 'Travel needs']);

        component.requestForm.patchValue({ order: 'hotel' });
        showPreferences();
        expect(Array.from(host().querySelectorAll('legend')).map(l => l.textContent)).toEqual(['Hotel', 'Travel needs']);
      });

      it('lists the options and airlines from the configuration', () => {
        valid();
        showPreferences();

        expect(host().querySelectorAll('#pref-cabin option')).toHaveLength(3);
        expect(host().querySelectorAll('#pref-stops option')).toHaveLength(3);
        expect(host().querySelectorAll('.preferences__chip')).toHaveLength(12);
      });

      it('hides the layover field for a direct flight', () => {
        valid();
        showPreferences();
        expect(host().querySelector('#pref-layover')).not.toBeNull();

        component.preferenceForm.get('flight.stops')?.setValue('direct');
        showPreferences();
        expect(host().querySelector('#pref-layover')).toBeNull();
      });

      it('toggles preferred airlines', () => {
        component.togglePreferredAirline('ly');
        component.togglePreferredAirline('af');
        component.togglePreferredAirline('ly');

        expect(component.preferenceForm.get('flight.preferredAirlines')?.value).toEqual(['af']);
        expect(component.isPreferredAirline('af')).toBe(true);
        expect(component.isPreferredAirline('ly')).toBe(false);
      });

      it('rejects more rooms than travelers and rooms above the limit', () => {
        valid();
        component.preferenceForm.get('hotel.rooms')?.setValue(2);
        expect(component.requestForm.hasError('tooManyRooms')).toBe(true);
        expect(component.requestForm.valid).toBe(false);

        component.preferenceForm.get('hotel.rooms')?.setValue(6);
        expect(component.preferenceForm.get('hotel.rooms')?.hasError('max')).toBe(true);

        component.requestForm.patchValue({ order: 'flight' });
        component.preferenceForm.get('hotel.rooms')?.setValue(1);
        expect(component.requestForm.hasError('tooManyRooms')).toBe(false);
      });

      it('rejects out-of-range layover and flexible days and notes that are too long', () => {
        valid();
        component.preferenceForm.get('flight.maxLayoverHours')?.setValue(30);
        component.preferenceForm.get('flight.flexibleDays')?.setValue(9);
        component.preferenceForm.get('notes')?.setValue('a'.repeat(501));

        expect(component.preferenceForm.get('flight.maxLayoverHours')?.invalid).toBe(true);
        expect(component.preferenceForm.get('flight.flexibleDays')?.invalid).toBe(true);
        expect(component.preferenceForm.get('notes')?.hasError('tooLong')).toBe(true);
        expect(component.requestForm.valid).toBe(false);

        component.preferenceForm.get('notes')?.setValue(` ${'a'.repeat(500)} `);
        expect(component.preferenceForm.get('notes')?.valid).toBe(true);
      });

      it('sends the wishes with the order, only for the parts that were asked for', () => {
        const addOrder = vi.spyOn(TestBed.inject(OrderStore), 'addOrder').mockReturnValue(of({} as Order));
        valid();
        component.requestForm.patchValue({ order: 'flight' });
        component.preferenceForm.get('flight')?.patchValue({ stops: 'direct', checkedBaggage: true, cabin: 'business' });
        component.preferenceForm.get('notes')?.setValue('  Window seat  ');

        component.onSubmit();

        const { preferences } = addOrder.mock.calls[0][0];
        expect(preferences?.flight).toMatchObject({ stops: 'direct', checkedBaggage: true, cabin: 'business', flexibleDays: 0 });
        expect(preferences?.hotel).toBeUndefined();
        expect(preferences?.notes).toBe('Window seat');
      });

      it('goes back to the defaults after a submit', () => {
        vi.spyOn(TestBed.inject(OrderStore), 'addOrder').mockReturnValue(of({} as Order));
        valid();
        component.preferenceForm.get('flight.cabin')?.setValue('business');
        component.preferenceForm.get('notes')?.setValue('x');

        component.onSubmit();

        expect(component.preferenceForm.get('flight.cabin')?.value).toBe('economy');
        expect(component.preferenceForm.get('flight.stops')?.value).toBe('max2');
        expect(component.preferenceForm.get('notes')?.value).toBe('');
        expect(component.hotel.get('stars')?.value).toBe(3);
      });
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

  describe('assigning an agent', () => {
    const agentsOf = (...names: string[]): Agent[] =>
      names.map((username, id) => ({ id, username, displayName: username, title: '', bio: '', languages: [], specialties: [], yearsExperience: 1, email: '', available: true, active: true }));

    const submitValid = () => {
      component.requestForm.patchValue({
        origin: 'Tel Aviv',
        destination: 'Paris', destinationId: 'paris',
        Dates: { departureDate: daysFromToday(5), returnDate: daysFromToday(9) },
        passDetails: [{ fullName: 'Dana Levi', passID: VALID_ID }],
        price: '500'
      });
      component.onSubmit();
    };

    it('gives the request to the least busy agent and records why', () => {
      const addOrder = vi.spyOn(TestBed.inject(OrderStore), 'addOrder').mockReturnValue(of({} as Order));
      patchState(unprotected(TestBed.inject(AgentStore)), { agents: agentsOf('dana', 'noa') });
      patchState(unprotected(TestBed.inject(OrderStore)), { orders: [{ id: 1, agent: 'dana', status: 'pending' } as Order] });

      submitValid();

      const sent = addOrder.mock.calls[0][0];
      expect(sent.agent).toBe('noa');
      expect(sent.assignedAt).toBe(sent.createdAt);
      expect(sent.assignments).toEqual([{ agent: 'noa', at: sent.createdAt, reason: 'initial' }]);
    });

    it('still sends the request when there are no agents to assign', () => {
      const addOrder = vi.spyOn(TestBed.inject(OrderStore), 'addOrder').mockReturnValue(of({} as Order));

      submitValid();

      expect(addOrder.mock.calls[0][0].agent).toBeUndefined();
    });

    it('keeps what was typed when the request cannot be sent', () => {
      vi.spyOn(TestBed.inject(OrderStore), 'addOrder').mockReturnValue(throwError(() => new Error('down')));

      submitValid();

      expect(component.requestForm.value.destination).toBe('Paris');
      expect(component.passDetails.at(0).value.fullName).toBe('Dana Levi');
    });
  });

  describe('after the request is sent', () => {
    const fill = () => component.requestForm.patchValue({
      origin: 'Tel Aviv',
      destination: 'Paris', destinationId: 'paris',
      Dates: { departureDate: daysFromToday(5), returnDate: daysFromToday(9) },
      passDetails: [{ fullName: 'Dana Levi', passID: VALID_ID }],
      price: '500'
    });

    it('opens the status page of the new request', () => {
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      vi.spyOn(TestBed.inject(OrderStore), 'addOrder').mockReturnValue(of({ id: 12 } as Order));
      fill();

      component.onSubmit();

      expect(navigate).toHaveBeenCalledWith(['/my-request', 12]);
    });

    it('stays on the form when the request could not be sent', () => {
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      vi.spyOn(TestBed.inject(OrderStore), 'addOrder').mockReturnValue(throwError(() => new Error('down')));
      fill();

      component.onSubmit();

      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('changing a request that is waiting for its agent', () => {
    const existing: Order = {
      id: 5,
      orderID: '5',
      choice: 'flight',
      status: 'pending',
      departureDate: daysFromToday(10),
      returnDate: daysFromToday(15),
      origin: 'Tel Aviv',
      destination: 'Rome', destinationId: 'paris',
      passDetails: [{ fullName: 'Dana Levi', passID: 123456782 }, { fullName: 'Noa Levi', passID: 987654324 }],
      priceRange: 700,
      customer: 'dana',
      createdAt: '2026-10-01T09:00:00.000Z',
      agent: 'noa',
      preferences: { flight: { stops: 'direct', checkedBaggage: true, cabin: 'business', departureTime: 'morning', preferredAirlines: ['ly'], flexibleDays: 2 }, notes: 'Quiet please' }
    };

    beforeEach(() => {
      component.editing = existing;
      component.ngOnChanges();
      fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck();
      fixture.detectChanges();
    });

    it('starts from what the customer asked for', () => {
      expect(component.requestForm.value).toMatchObject({ order: 'flight', origin: 'Tel Aviv', destination: 'Rome', destinationId: 'paris', price: '700' });
      expect(component.Dates.value.departureDate).toBe(existing.departureDate);
      expect(component.passDetails.value).toEqual([{ fullName: 'Dana Levi', passID: '123456782' }, { fullName: 'Noa Levi', passID: '987654324' }]);
      expect(component.preferenceForm.get('flight.cabin')?.value).toBe('business');
      expect(component.preferenceForm.get('flight.preferredAirlines')?.value).toEqual(['ly']);
      expect(component.preferenceForm.get('notes')?.value).toBe('Quiet please');
      expect(component.preferenceForm.get('hotel.rooms')?.value).toBe(1);
      expect(component.requestForm.valid).toBe(true);
    });

    it('says it is editing', () => {
      expect(component.isEditing).toBe(true);
      expect(host().textContent).toContain('Edit your request');
    });

    it('saves the changes without touching who made the request, when, its number or status', () => {
      const updatePending = vi.spyOn(TestBed.inject(OrderStore), 'updatePending').mockReturnValue(of({ ...existing, destination: 'Lisbon', destinationId: 'paris' }));
      const note = vi.spyOn(TestBed.inject(MessageStore), 'note').mockReturnValue(of({} as Message));
      const saved: Order[] = [];
      component.saved.subscribe(order => saved.push(order));
      component.requestForm.patchValue({ destination: 'Lisbon', destinationId: 'paris' });

      component.onSubmit();

      const changes = updatePending.mock.calls[0][1] as Record<string, unknown>;
      expect(updatePending.mock.calls[0][0]).toBe(5);
      expect(changes['destination']).toBe('Lisbon');
      expect(changes['passDetails']).toEqual([{ fullName: 'Dana Levi', passID: 123456782 }, { fullName: 'Noa Levi', passID: 987654324 }]);
      ['customer', 'createdAt', 'orderID', 'status'].forEach(key => expect(changes).not.toHaveProperty(key));
      expect(note).toHaveBeenCalledWith(5, 'The customer updated this request.');
      expect(saved).toHaveLength(1);
    });

    it('does not create a new request or reset the form', () => {
      const addOrder = vi.spyOn(TestBed.inject(OrderStore), 'addOrder');
      vi.spyOn(TestBed.inject(OrderStore), 'updatePending').mockReturnValue(of(existing));
      vi.spyOn(TestBed.inject(MessageStore), 'note').mockReturnValue(of({} as Message));

      component.onSubmit();

      expect(addOrder).not.toHaveBeenCalled();
      expect(component.requestForm.value.destination).toBe('Rome');
    });

    it('does not announce a save that failed', () => {
      vi.spyOn(TestBed.inject(OrderStore), 'updatePending').mockReturnValue(throwError(() => new Error('Only a request that is still waiting for an agent can be changed.')));
      const saved: Order[] = [];
      component.saved.subscribe(order => saved.push(order));

      component.onSubmit();

      expect(saved).toEqual([]);
    });
  });

  describe('the number of a new request', () => {
    const send = () => {
      const addOrder = vi.spyOn(TestBed.inject(OrderStore), 'addOrder').mockReturnValue(of({} as Order));
      component.requestForm.patchValue({
        origin: 'Tel Aviv',
        destination: 'Paris', destinationId: 'paris',
        Dates: { departureDate: daysFromToday(5), returnDate: daysFromToday(9) },
        passDetails: [{ fullName: 'Dana Levi', passID: VALID_ID }],
        price: '500'
      });
      component.onSubmit();
      return addOrder.mock.calls[0][0];
    };

    it('leaves the request number to the backend, so two requests sent together cannot share one', () => {
      const sent = send();

      expect(sent).not.toHaveProperty('id');
      expect(sent).not.toHaveProperty('orderID');
    });
  });

  describe('a destination chosen before the form opened', () => {
    const open = (place: string | undefined) => {
      fixture = TestBed.createComponent(UserRequestsComponent);
      component = fixture.componentInstance;
      component.initialDestination = place;
      fixture.detectChanges();
    };

    it('selects that destination, with the name we give it', () => {
      open('tokyo');

      expect(component.requestForm.value).toMatchObject({ destinationId: 'tokyo', destination: 'Tokyo' });
      expect(buttonLabelled('Next')?.disabled).toBe(false);
    });

    it('leaves the destination empty for something that is not one of ours', () => {
      open('atlantis');

      expect(component.requestForm.value.destinationId).toBe('');
    });

    it('does not overwrite a request that is being edited', () => {
      fixture = TestBed.createComponent(UserRequestsComponent);
      component = fixture.componentInstance;
      component.initialDestination = 'tokyo';
      component.editing = { id: 1, orderID: '1', choice: 'both', status: 'pending', departureDate: daysFromToday(5), returnDate: daysFromToday(9), origin: 'Tel Aviv', destination: 'Rome', destinationId: 'paris', passDetails: [{ fullName: 'Dana Levi', passID: 123456782 }], priceRange: 500 };
      fixture.detectChanges();
      component.ngOnChanges();

      expect(component.requestForm.value.destination).toBe('Rome');
    });
  });
});
