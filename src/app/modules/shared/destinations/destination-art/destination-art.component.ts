import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';

import { DestinationStore } from 'src/app/services/destination/destination.store';

/** A square picture for a destination: its photo, or the emoji on its gradient when there is none or it fails to load. Size it with `--art-size`. */
@Component({
  standalone: true,
  selector: 'destination-art',
  template: `
    <span class="art" [style.background]="place()?.gradient ?? 'var(--color-surface-raised)'" aria-hidden="true">
      @if (place()?.imageSrc && failed() !== place()?.imageSrc) {
        <img class="art__image" [src]="place()?.imageSrc" alt="" loading="lazy" (error)="failed.set(place()?.imageSrc ?? null)" />
      } @else {
        <span class="art__emoji">{{ place()?.emoji ?? '📍' }}</span>
      }
    </span>
  `,
  styles: `
    :host { display: block; flex: none; width: var(--art-size, 3.25rem); height: var(--art-size, 3.25rem); }
    .art { display: grid; place-items: center; width: 100%; height: 100%; overflow: hidden; border-radius: var(--radius-md); }
    .art__image { width: 100%; height: 100%; object-fit: cover; }
    .art__emoji { font-size: calc(var(--art-size, 3.25rem) * 0.5); line-height: 1; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DestinationArtComponent {
  destinationId = input.required<string>();
  readonly failed = signal<string | null>(null);

  private store = inject(DestinationStore);
  readonly place = computed(() => this.store.byId(this.destinationId()));
}
