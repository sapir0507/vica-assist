import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { PasswordResetService } from 'src/app/services/password-reset/password-reset.service';

/** Asks for a reset link. There is no mail server, so the "email" is shown on the page and labelled as a demo. */
@Component({
  standalone: true,
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatIconModule, RouterLink]
})
export class ForgotPasswordComponent {
  private passwordReset = inject(PasswordResetService);

  readonly formGroup = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  readonly sent = signal<{ username: string; token: string } | null>(null);
  readonly sending = signal(false);
  readonly failed = signal(false);

  onSubmit(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const username = this.formGroup.getRawValue().username.trim();
    this.failed.set(false);
    this.sending.set(true);
    this.passwordReset.request(username).subscribe({
      next: token => {
        this.sending.set(false);
        this.sent.set({ username, token });
      },
      error: () => {
        this.sending.set(false);
        this.failed.set(true);
      }
    });
  }
}
