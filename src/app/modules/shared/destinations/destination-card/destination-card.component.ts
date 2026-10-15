import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CurrencyPipe, NgTemplateOutlet } from '@angular/common';

import { Destination } from '@vica-assist/shared';

@Component({
  standalone: true,
  selector: 'destination-card',
  templateUrl: './destination-card.component.html',
  styleUrls: ['./destination-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, NgTemplateOutlet]
})
export class DestinationCardComponent {
  destination = input.required<Destination>();
  selectable = input(false);
  /** Makes the card a button that opens something (a panel), without radio semantics. */
  opens = input(false);
  selected = input(false);
  chosen = output<Destination>();
  /** The photo that failed to load, so the emoji shows instead. */
  readonly failedImage = signal<string | null>(null);

  choose(): void {
    if (this.selectable() || this.opens()) this.chosen.emit(this.destination());
  }
}
