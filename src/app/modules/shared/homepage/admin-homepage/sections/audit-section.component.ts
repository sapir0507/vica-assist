import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AuditStore } from 'src/app/services/audit/audit.store';

@Component({
  standalone: true,
  selector: 'admin-audit',
  templateUrl: './audit-section.component.html',
  styleUrls: ['./sections.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe]
})
export class AuditSectionComponent {
  private store = inject(AuditStore);

  readonly text = signal('');
  readonly entries = computed(() => {
    const query = this.text().trim().toLowerCase();
    return [...(this.store.entries() ?? [])]
      .filter(entry => !query || `${entry.actor} ${entry.action} ${entry.detail}`.toLowerCase().includes(query))
      .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  });

  constructor() {
    this.store.load();
  }
}
