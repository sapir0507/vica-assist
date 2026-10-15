import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** A button that switches a password input between hidden and readable text. */
@Component({
  standalone: true,
  selector: 'password-toggle',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="password-toggle"
      [attr.aria-label]="visible() ? 'Hide password' : 'Show password'"
      [attr.aria-pressed]="visible()"
      (click)="toggle()"
    >
      <mat-icon [svgIcon]="visible() ? 'visibility_off' : 'visibility'" aria-hidden="true"></mat-icon>
    </button>
  `
})
export class PasswordToggleComponent {
  input = input.required<HTMLInputElement>();
  readonly visible = signal(false);

  toggle(): void {
    this.visible.update(visible => !visible);
    this.input().type = this.visible() ? 'text' : 'password';
  }
}
