import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ConfigService, isOverdue, Order } from '@vica-assist/shared';

import { AdminService } from 'src/app/services/admin/admin.service';
import { AgentStore } from 'src/app/services/agent/agent.store';
import { OrderStore } from 'src/app/services/order/order.store';

type Filter = 'all' | 'pending' | 'finished' | 'cancelled';

@Component({
  standalone: true,
  selector: 'admin-requests',
  templateUrl: './requests-section.component.html',
  styleUrls: ['./sections.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe]
})
export class RequestsSectionComponent {
  private orderStore = inject(OrderStore);
  private agentStore = inject(AgentStore);
  private config = inject(ConfigService);
  private admin = inject(AdminService);

  readonly filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Waiting for an agent' },
    { id: 'finished', label: 'Answered' },
    { id: 'cancelled', label: 'Cancelled' }
  ];
  readonly filter = signal<Filter>('all');
  readonly error = signal<string | null>(null);
  readonly agents = computed(() => this.agentStore.active());

  readonly requests = computed(() =>
    (this.orderStore.orders() ?? [])
      .filter(order => this.filter() === 'all' || order.status === this.filter())
      .sort((a, b) => (Date.parse(b.createdAt ?? '') || 0) - (Date.parse(a.createdAt ?? '') || 0))
  );

  constructor() {
    this.agentStore.load();
  }

  select(filter: string): void {
    this.filter.set(filter as Filter);
  }

  isLate(order: Order): boolean {
    return order.status === 'pending' && isOverdue(order, new Date(), this.config.config().assignment);
  }

  nameOf(username: string | undefined): string {
    return this.agentStore.byUsername(username ?? '')?.displayName ?? username ?? 'Nobody yet';
  }

  statusOf(order: Order): string {
    return order.status === 'finished' ? 'answered' : order.status === 'pending' ? 'waiting' : order.status;
  }

  reassign(order: Order, to: string): void {
    if (!to || to === order.agent) return;
    this.error.set(null);
    this.admin.reassign(order.id, to).subscribe({ error: (error: Error) => this.error.set(error.message) });
  }
}
