import { ComponentFixture, TestBed } from '@angular/core/testing';
import { API_URL, Order } from '@vica-assist/shared';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { MyFlightsComponent } from './my-flights.component';
import { MyFlightsService } from './my-flights.service';

describe('MyFlightsComponent', () => {
  let component: MyFlightsComponent;
  let fixture: ComponentFixture<MyFlightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: API_URL, useValue: 'http://localhost:3000/' }],
      imports: [ HttpClientTestingModule, ReactiveFormsModule, MatSnackBarModule ],
      declarations: [ MyFlightsComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyFlightsComponent);
    component = fixture.componentInstance;
    // The template wires several Material form controls that need their
    // real modules imported to render; this is a construction smoke test,
    // so it intentionally skips detectChanges() rather than pulling in the
    // full Material form-field stack.
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('prefills the dates from the order as date-input values', () => {
    fixture.componentRef.setInput('order', {
      id: 1,
      orderID: 'o-1',
      choice: 'flight',
      status: 'pending',
      origin: 'Israel',
      destination: 'Paris', destinationId: 'paris',
      departureDate: new Date(2026, 5, 9).toISOString(),
      returnDate: new Date(2026, 5, 16).toISOString(),
      passDetails: [{ fullName: 'Jane Doe', passID: 12345678 }],
      priceRange: 500
    });

    component.ngOnInit();

    expect(component.newFlightForm.value.departureDate).toBe('2026-06-09');
    expect(component.newFlightForm.value.returnDate).toBe('2026-06-16');
  });

  it('flags a return date before the departure date', () => {
    component.newFlightForm.patchValue({ departureDate: '2026-06-10', returnDate: '2026-06-09' });

    expect(component.newFlightForm.hasError('dateRange')).toBe(true);
  });

  it('requires a stop duration only when the flight has a stop', () => {
    const stopDuration = component.newFlightForm.controls['stopDuration'];

    component.newFlightForm.patchValue({ stops: '1' });
    component.onSelectionChange();
    expect(stopDuration.hasError('required')).toBe(true);

    component.newFlightForm.patchValue({ stops: '0' });
    component.onSelectionChange();
    expect(stopDuration.valid).toBe(true);
  });

  describe('the customer\'s request', () => {
    const order = {
      id: 3,
      orderID: '3',
      choice: 'both',
      status: 'pending',
      origin: 'Israel',
      destination: 'Paris', destinationId: 'paris',
      departureDate: '2026-12-01',
      returnDate: '2026-12-08',
      passDetails: [{ fullName: 'Dana Levi', passID: 123456782 }],
      priceRange: 1000,
      preferences: {
        flight: { stops: 'direct', checkedBaggage: true, cabin: 'business', departureTime: 'morning', preferredAirlines: ['ly'], flexibleDays: 0 }
      }
    } as unknown as Order;

    beforeEach(() => {
      fixture.componentRef.setInput('order', order);
      component.ngOnInit();
    });

    it('fills in the destination of the request and does not let the agent change it', () => {
      expect(component.newFlightForm.get('dest')?.value).toBe('Paris');
      expect(component.newFlightForm.get('dest')?.disabled).toBe(true);
    });

    it('lists what the customer asked for', () => {
      expect(component.wishes).toEqual(['Direct only', 'Checked baggage', 'Business', 'Morning departure', 'Prefers El Al']);
    });

    it('starts with the cabin the customer asked for', () => {
      expect(component.newFlightForm.value.cabin).toBe('business');
    });

    it('warns about every difference and goes quiet when the flight matches', () => {
      component.newFlightForm.patchValue({ stops: '1', airlineId: 'tk', cabin: 'economy', bagage: 'false', departureHour: '20:00', price: 1500 });
      expect(component.warnings).toHaveLength(6);

      component.newFlightForm.patchValue({ stops: '0', airlineId: 'ly', cabin: 'business', bagage: 'true', departureHour: '08:00', price: 900 });
      expect(component.warnings).toEqual([]);
    });

    it('lets the agent save a flight that differs, with the airline name and cabin', () => {
      const addFlight = vi.spyOn(TestBed.inject(MyFlightsService), 'addFlight').mockReturnValue(undefined);
      component.newFlightForm.patchValue({
        dest: 'France', org: 'Israel', departureDate: '2026-12-01', returnDate: '2026-12-08', departureHour: '20:00', returnHour: '10:00',
        stops: '1', stopDuration: '02:00', bagage: 'false', airlineId: 'tk', cabin: 'economy', price: '450'
      });
      component.orderID = '3';

      expect(component.warnings.length).toBeGreaterThan(0);
      component.addFlight();

      expect(addFlight).toHaveBeenCalledWith(expect.objectContaining({ airlineId: 'tk', airline: 'Turkish Airlines', cabin: 'economy', orderID: '3' }));
    });
  });

  it('offers the active airlines, the cabins and as many stops as the configuration allows', () => {
    expect(component.airlines).toHaveLength(12);
    expect(component.cabins.map(c => c.id)).toEqual(['economy', 'premium', 'business']);
    expect(component.stopChoices).toEqual([0, 1, 2]);
  });

  it('needs an airline and rejects a one-word name and an ID with a wrong check digit', () => {
    const form = component.newFlightForm;

    expect(form.get('airlineId')?.hasError('required')).toBe(true);

    form.patchValue({ fullName: 'Dana', myID: '123456789' });
    expect(form.get('fullName')?.hasError('fullName')).toBe(true);
    expect(form.get('myID')?.hasError('israeliId')).toBe(true);

    form.patchValue({ fullName: 'Dana Levi', myID: '123456782' });
    expect(form.get('fullName')?.valid).toBe(true);
    expect(form.get('myID')?.valid).toBe(true);
  });

  it('asks for a layover time from one stop up', () => {
    component.newFlightForm.patchValue({ stops: '2' });
    component.onSelectionChange();
    expect(component.hasStop()).toBe(true);
    expect(component.newFlightForm.get('stopDuration')?.hasError('required')).toBe(true);

    component.newFlightForm.patchValue({ stops: '0' });
    component.onSelectionChange();
    expect(component.hasStop()).toBe(false);
  });
});
