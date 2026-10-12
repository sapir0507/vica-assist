import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, input, output, viewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { normalisePlace, PublicSummary } from '@vica-assist/shared';

import { Destination } from '../destinations';

/** What visitors can learn about a destination. The sign-in button is the only way on from here. */
@Component({
  standalone: true,
  selector: 'destination-panel',
  templateUrl: './destination-panel.component.html',
  styleUrls: ['./destination-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink]
})
export class DestinationPanelComponent {
  destination = input<Destination | null>(null);
  summary = input<PublicSummary | null | undefined>(null);
  closed = output<void>();

  private dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  readonly stats = computed(() => {
    const summary = this.summary();
    const name = normalisePlace(this.destination()?.name);
    return summary?.sufficient ? summary.topDestinations.find(place => normalisePlace(place.name) === name) : undefined;
  });

  readonly reviews = computed(() => {
    const summary = this.summary();
    const name = normalisePlace(this.destination()?.name);
    return summary?.sufficient ? summary.reviews.filter(review => normalisePlace(review.destination) === name) : [];
  });

  constructor() {
    effect(() => {
      const element = this.dialog()?.nativeElement;
      if (!element) return;
      if (this.destination() && !element.open) {
        if (typeof element.showModal === 'function') element.showModal();
        else element.setAttribute('open', '');
      } else if (!this.destination() && element.open) {
        if (typeof element.close === 'function') element.close();
        else element.removeAttribute('open');
      }
    });
  }

  onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog()?.nativeElement) this.close();
  }

  close(): void {
    const element = this.dialog()?.nativeElement;
    if (!element) return;
    if (typeof element.close === 'function') {
      element.close();
    } else {
      element.removeAttribute('open');
      this.closed.emit();
    }
  }
}
