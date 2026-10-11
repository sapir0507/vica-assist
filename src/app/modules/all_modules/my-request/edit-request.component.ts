import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Order } from '@vica-assist/shared';

import { OrderStore } from 'src/app/services/order/order.store';
import { SessionStore } from 'src/app/services/session/session.store';
import { UserRequestsModule } from '../user-requests/user-requests.module';

/** Changing a request is only possible while it waits for its agent, and only for its owner. */
@Component({
  standalone: true,
  selector: 'edit-request',
  template: `
    <div class="page">
      @if (orderStore.orders() === undefined) {
        <p class="choice-grid__empty">Loading your request...</p>
      } @else if (order(); as request) {
        <userRequests [editing]="request" (saved)="back()"></userRequests>
      } @else {
        <p class="choice-grid__empty">This request cannot be changed any more.</p>
        <a mat-flat-button [routerLink]="['/my-request', id]">Back to your request</a>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, UserRequestsModule]
})
export class EditRequestComponent {
  protected orderStore = inject(OrderStore);
  private sessionStore = inject(SessionStore);
  private router = inject(Router);

  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  readonly order = computed<Order | undefined>(() =>
    this.orderStore.orders()?.find(order => order.id === this.id && order.customer === this.sessionStore.username() && order.status === 'pending')
  );

  back(): void {
    this.router.navigate(['/my-request', this.id]);
  }
}
