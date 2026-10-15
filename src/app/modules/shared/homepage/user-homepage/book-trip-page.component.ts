import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { UserRequestsModule } from 'src/app/modules/all_modules/user-requests/user-requests.module';
import { DestinationStore } from 'src/app/services/destination/destination.store';

@Component({
  standalone: true,
  selector: 'book-trip-page',
  template: `
    <div class="page">
      <a mat-button class="back" routerLink="/homepage">
        <mat-icon svgIcon="arrow_circle_left" aria-hidden="true"></mat-icon>
        Back
      </a>
      <userRequests [initialDestination]="plannedDestination?.id"></userRequests>
    </div>
  `,
  styles: ':host { display: block; } .back { margin-bottom: var(--space-4); }',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule, UserRequestsModule]
})
export class BookTripPageComponent {
  /** A destination chosen on the homepage, used only when it is one we offer, never as an address. */
  readonly plannedDestination = inject(DestinationStore).bookable(inject(ActivatedRoute).snapshot.queryParamMap.get('destination'));
}
