import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { InvalidResetLinkError, PasswordResetService } from 'src/app/services/password-reset/password-reset.service';
import { PasswordToggleComponent } from '../password-toggle/password-toggle.component';

const passwordsMatch = (group: AbstractControl): ValidationErrors | null =>
  group.get('password')?.value === group.get('confirm')?.value ? null : { mismatch: true };

/** The page a reset link opens: choose a new password, once. */
@Component({
  standalone: true,
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatIconModule, RouterLink, PasswordToggleComponent]
})
export class ResetPasswordComponent {
  private passwordReset = inject(PasswordResetService);
  private token = inject(ActivatedRoute).snapshot.queryParamMap.get('token');

  readonly formGroup = new FormGroup(
    {
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(4)] }),
      confirm: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    },
    { validators: passwordsMatch }
  );

  readonly linkInvalid = signal(!this.token);
  readonly done = signal(false);
  readonly failed = signal(false);
  readonly saving = signal(false);

  onSubmit(): void {
    if (this.formGroup.invalid || !this.token) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.failed.set(false);
    this.saving.set(true);
    this.passwordReset.reset(this.token, this.formGroup.getRawValue().password).subscribe({
      next: () => {
        this.saving.set(false);
        this.done.set(true);
      },
      error: error => {
        this.saving.set(false);
        if (error instanceof InvalidResetLinkError) this.linkInvalid.set(true);
        else this.failed.set(true);
      }
    });
  }
}
