import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Flights, provideAppIcons } from '@vica-assist/shared';

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
});
