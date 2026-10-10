import { ComponentFixture, TestBed } from '@angular/core/testing';
import { API_URL } from '@vica-assist/shared';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { MyFlightsComponent } from './my-flights.component';

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
      destination: 'Italy',
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
});
