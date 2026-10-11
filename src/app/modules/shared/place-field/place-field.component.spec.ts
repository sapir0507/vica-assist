import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { knownPlace } from '@vica-assist/shared';
import { notBlank } from 'src/app/modules/all_modules/user-requests/validators';
import { PlaceFieldComponent } from './place-field.component';

describe('PlaceFieldComponent', () => {
  let fixture: ComponentFixture<PlaceFieldComponent>;
  let control: FormControl<string | null>;
  const host = () => fixture.nativeElement as HTMLElement;
  const input = () => host().querySelector('input') as HTMLInputElement;

  const type = (text: string) => {
    input().value = text;
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PlaceFieldComponent], providers: [provideNoopAnimations()] });
    control = new FormControl('', [Validators.required, notBlank, knownPlace]);
    fixture = TestBed.createComponent(PlaceFieldComponent);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('label', 'Origin');
    fixture.componentRef.setInput('blankMessage', 'Enter where you are travelling from.');
    fixture.detectChanges();
  });

  it('writes what is typed into the control', () => {
    type('Lisbon');

    expect(control.value).toBe('Lisbon');
    expect(control.valid).toBe(true);
  });

  it('suggests matching places as you type, without needing the accent', () => {
    control.setValue('sao');

    expect(fixture.componentInstance.suggestions).toEqual(['São Paulo']);
  });

  it('asks for a country or city when the place is not known', () => {
    type('Flat 5 Main Street');
    control.markAsTouched();
    fixture.detectChanges();

    expect(host().textContent).toContain('Pick a country or city from the list.');
  });

  it('marks the field as touched when it loses focus, so its error shows', () => {
    type('Atlantis');
    expect(control.touched).toBe(false);

    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(control.touched).toBe(true);
    expect(host().textContent).toContain('Pick a country or city from the list.');
  });

  it('shows the message it was given when the field is blank', () => {
    type('   ');
    control.markAsTouched();
    fixture.detectChanges();

    expect(host().textContent).toContain('Enter where you are travelling from.');
  });
});
