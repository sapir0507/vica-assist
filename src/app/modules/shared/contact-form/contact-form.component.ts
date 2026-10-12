import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ConfigService, collapseSpaces } from '@vica-assist/shared';

import { InquiryStore } from 'src/app/services/inquiry/inquiry.store';

const STORAGE_KEY = 'vica-last-inquiry';
export const SEND_INTERVAL_MS = 60_000;
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 1000;
const NAME = /^[\p{L}][\p{L} .'-]{1,59}$/u;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const name = (control: AbstractControl): ValidationErrors | null =>
  collapseSpaces(String(control.value ?? '')) === '' || NAME.test(collapseSpaces(String(control.value))) ? null : { name: true };

const email = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  return value === '' || (EMAIL.test(value) && value.length <= 254) ? null : { email: true };
};

const message = (control: AbstractControl): ValidationErrors | null => {
  const length = String(control.value ?? '').trim().length;
  if (length === 0) return null;
  if (length < MESSAGE_MIN) return { tooShort: true };
  return length > MESSAGE_MAX ? { tooLong: true } : null;
};

/** A visitor's question for the admin. Not a booking form: it asks for no trip details and promises no quote. */
@Component({
  standalone: true,
  selector: 'contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatButtonModule]
})
export class ContactFormComponent {
  private store = inject(InquiryStore);
  readonly maxMessage = MESSAGE_MAX;
  readonly responseHours = inject(ConfigService).config().assignment.responseHours;

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, name] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, email] }),
    message: new FormControl('', { nonNullable: true, validators: [Validators.required, message] }),
    website: new FormControl('', { nonNullable: true })
  });

  readonly sent = signal(false);
  readonly sending = signal(false);
  readonly error = signal<string | null>(null);

  get messageLength(): number {
    return this.form.controls.message.value.trim().length;
  }

  private waitSeconds(): number {
    let last = 0;
    try {
      last = Number(localStorage.getItem(STORAGE_KEY)) || 0;
    } catch {
      return 0;
    }
    return Math.max(0, Math.ceil((last + SEND_INTERVAL_MS - Date.now()) / 1000));
  }

  private remember(): void {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* the limit is a courtesy; without storage it simply is not applied */
    }
  }

  submit(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.form.controls.website.value !== '') {
      this.finish();
      return;
    }
    const wait = this.waitSeconds();
    if (wait > 0) {
      this.error.set(`Please wait ${wait} seconds before sending another message.`);
      return;
    }

    const { name: sender, email: address, message: text } = this.form.getRawValue();
    this.sending.set(true);
    this.store.submit({ name: collapseSpaces(sender), email: address.trim(), message: text.trim() }).subscribe({
      next: () => {
        this.remember();
        this.finish();
      },
      error: () => {
        this.error.set('We could not send your message. Please try again in a moment.');
        this.sending.set(false);
      }
    });
  }

  private finish(): void {
    this.form.reset({ name: '', email: '', message: '', website: '' });
    this.sending.set(false);
    this.sent.set(true);
  }

  writeAnother(): void {
    this.sent.set(false);
  }
}
