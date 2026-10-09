import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Flights } from '@vica-assist/shared';
import { FlightItemComponent } from './flight-item.component';

describe('FlightItemComponent', () => {
  let component: FlightItemComponent;
  let fixture: ComponentFixture<FlightItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlightItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
    const flight = { id: 1 } as Flights;
    const emitted: Flights[] = [];
    component.chosenFlight.subscribe(f => emitted.push(f));

    component.selectFlight(flight);

    expect(emitted).toEqual([flight]);
  });
});
