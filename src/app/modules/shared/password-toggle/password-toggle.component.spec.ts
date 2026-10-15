import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';

import { PasswordToggleComponent } from './password-toggle.component';

@Component({
  standalone: true,
  imports: [PasswordToggleComponent],
  template: `<input #pwd type="password" /><password-toggle [input]="pwd" />`
})
class HostComponent {}

describe('PasswordToggleComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  const host = () => fixture.nativeElement as HTMLElement;
  const field = () => host().querySelector('input') as HTMLInputElement;
  const button = () => host().querySelector('button') as HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent, MatIconTestingModule] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('starts hidden, with a button that offers to show the password', () => {
    expect(field().type).toBe('password');
    expect(button().type).toBe('button');
    expect(button().getAttribute('aria-label')).toBe('Show password');
    expect(button().getAttribute('aria-pressed')).toBe('false');
  });

  it('shows the password as text and back again', () => {
    button().click();
    fixture.detectChanges();
    expect(field().type).toBe('text');
    expect(button().getAttribute('aria-label')).toBe('Hide password');
    expect(button().getAttribute('aria-pressed')).toBe('true');

    button().click();
    fixture.detectChanges();
    expect(field().type).toBe('password');
  });
});
