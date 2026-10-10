import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe, NgTemplateOutlet } from '@angular/common';

import { Destination } from '../destinations';

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
  selected = input(false);
  chosen = output<Destination>();

  choose(): void {
    if (this.selectable()) this.chosen.emit(this.destination());
  }
}
