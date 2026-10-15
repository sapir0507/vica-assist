import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Flights, Order, provideAppIcons } from '@vica-assist/shared';

import { ItemModule } from '../item.module';
import { FlightItemComponent } from './flight-item.component';

const flight: Flights = {
  id: 1,
  org: 'tel aviv',
  dest: 'paris',
  departureDate: '2026-06-09',
  departureHour: '08:30',
  returnDate: '2026-06-16',
  returnHour: '21:10',
  stops: 'one stop',
  stopDuration: '02:15',
  fullName: 'Jane Doe',
  passID: 12345678,
  passangers: 2,
  passArray: [{ id: 2, fullName: 'John Doe', passID: 87654321 }],
  bagage: 'yes',
  moreInfo: 'Window seats',
  price: 450
};

describe('FlightItemComponent', () => {
  let component: FlightItemComponent;
  let fixture: ComponentFixture<FlightItemComponent>;
  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemModule],
      providers: [provideAppIcons()]
    }).compileComponents();

    fixture = TestBed.createComponent(FlightItemComponent);
    component = fixture.componentInstance;
  });

  it('renders nothing without a flight', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mat-accordion')).toBeNull();
  });

  it('shows the route, times, stops, passengers and price', () => {
    fixture.componentRef.setInput('flight', flight);
    fixture.detectChanges();

    expect(text()).toContain('tel aviv');
    expect(text()).toContain('paris');
    expect(text()).toContain('08:30');
    expect(text()).toContain('21:10');
    expect(text()).toContain('one stop');
    expect(text()).toContain('(02:15)');
    expect(text()).toContain('Jane Doe, 12345678');
    expect(text()).toContain('John Doe, 87654321');
    expect(text()).toContain('Baggage included');
    expect(text()).toContain('$450.00');
  });

  it('starts on the first step', () => {
    expect(component.step).toBe(0);
  });

  it('setStep jumps directly to the given panel', () => {
    component.setStep(2);
    expect(component.step).toBe(2);
  });

  it('nextStep advances one panel at a time', () => {
    component.nextStep();
    expect(component.step).toBe(1);
  });

  it('nextStep does not advance past the last panel', () => {
    component.setStep(2);
    component.nextStep();
    expect(component.step).toBe(2);
  });

  it('prevStep does not go below the first panel', () => {
    component.prevStep();
    expect(component.step).toBe(0);
  });

  it('selectFlight emits the chosen flight', () => {
    const emitted: Flights[] = [];
    component.chosenFlight.subscribe(f => emitted.push(f));
    fixture.componentRef.setInput('flight', flight);
    fixture.detectChanges();

    const select = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
      .find(b => b.textContent?.includes('Select flight'));
    select?.click();

    expect(emitted).toEqual([flight]);
  });

  describe('airline, baggage and the customer\'s request', () => {
    const order = {
      id: 1,
      orderID: '1',
      choice: 'flight',
      status: 'finished',
      origin: 'tel aviv',
      destination: 'paris', destinationId: 'paris',
      departureDate: '2026-06-09',
      returnDate: '2026-06-16',
      passDetails: [],
      priceRange: 1000,
      preferences: { flight: { stops: 'direct', checkedBaggage: true, cabin: 'economy', departureTime: 'any', preferredAirlines: [], flexibleDays: 0 } }
    } as unknown as Order;

    const show = (value: Flights, customer?: Order) => {
      fixture.componentRef.setInput('flight', value);
      if (customer) fixture.componentRef.setInput('order', customer);
      fixture.detectChanges();
    };

    it('names the airline and the cabin', () => {
      show({ ...flight, airlineId: 'ly', airline: 'El Al', cabin: 'business', stops: '0' });

      expect(text()).toContain('El Al');
      expect(text()).toContain('Business');
      expect(text()).toContain('Direct');
      expect(component.airlineColor).toBe('#0b3d91');
    });

    it('says baggage is not included when the agent saved "false" (it is a text value)', () => {
      show({ ...flight, bagage: 'false' });

      expect(text()).toContain('Baggage not included');
    });

    it('writes the number of stops in words', () => {
      show({ ...flight, stops: '1' });
      expect(text()).toContain('1 stop');

      show({ ...flight, stops: '2' });
      expect(component.stopsLabel).toBe('2 stops');
    });

    it('says the flight matches the request', () => {
      show({ ...flight, stops: '0', bagage: 'true', price: 400 }, order);

      expect(text()).toContain('Matches your request');
    });

    it('lists how the flight differs from the request', () => {
      show({ ...flight, stops: '1', bagage: 'false', price: 400 }, order);

      expect(text()).toContain('Differs from your request');
      expect(text()).toContain('Has 1 stop; the customer asked for direct only.');
      expect(text()).toContain('Checked baggage is not included');
    });

    it('does not compare without a request', () => {
      show(flight);

      expect(component.differences).toBeNull();
      expect(text()).not.toContain('your request');
    });
  });
});
