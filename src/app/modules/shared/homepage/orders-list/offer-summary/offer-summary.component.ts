import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { MyFlightsService } from '@vica-assist/my-flights';
import { HotelsService } from '@vica-assist/my-hotels';
import { bookedParts } from '@vica-assist/shared';

@Component({
  standalone: true,
  selector: 'offer-summary',
  template: `@if (summary(); as text) { <p class="order-card__offers">{{ text }}</p> }`,
  styles: `
    .order-card__offers {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin: 0 0 var(--space-4);
      padding: var(--space-3);
      color: var(--color-success);
      background: color-mix(in srgb, var(--color-success) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--color-success) 30%, var(--color-border));
      border-radius: var(--radius-md);
    }
    .order-card__offers::before {
      content: '¹3';
      display: grid;
      flex: none;
      place-items: center;
      width: 2rem;
      height: 2rem;
      background: color-mix(in srgb, var(--color-success) 18%, transparent);
      border-radius: var(--radius-sm);
      font-weight: var(--weight-bold);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferSummaryComponent {
  orderId = input.required<number>();
  choice = input.required<string>();

  private flights = inject(MyFlightsService);
  private hotels = inject(HotelsService);

  private counts = toSignal(
    toObservable(this.orderId).pipe(
      switchMap(id => forkJoin({
        hotels: this.hotels.getHotelsByOrderID(id).pipe(map(list => list.length)),
        flights: this.flights.getFlightsByOrderID(String(id)).pipe(map(list => list.length))
      })),
      catchError(() => of(undefined))
    )
  );

  summary = computed(() => {
    const counts = this.counts();
    if (!counts) return '';
    const parts = bookedParts(this.choice()).map(part =>
      `${counts[`${part}s`]} ${part}${counts[`${part}s`] === 1 ? '' : 's'}`
    );
    return parts.length ? `Your agent added ${parts.join(' and ')} to choose from` : '';
  });
}
