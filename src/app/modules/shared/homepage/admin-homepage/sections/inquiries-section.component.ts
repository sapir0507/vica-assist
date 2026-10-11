import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Inquiry, InquiryStatus } from '@vica-assist/shared';

import { AdminService } from 'src/app/services/admin/admin.service';
import { InquiryStore } from 'src/app/services/inquiry/inquiry.store';

@Component({
  standalone: true,
  selector: 'admin-inquiries',
  templateUrl: './inquiries-section.component.html',
  styleUrls: ['./sections.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe]
})
export class InquiriesSectionComponent {
  private store = inject(InquiryStore);
  private admin = inject(AdminService);

  readonly error = signal<string | null>(null);
  readonly inquiries = computed(() =>
    [...(this.store.inquiries() ?? [])].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  );
  readonly newCount = computed(() => this.inquiries().filter(inquiry => inquiry.status === 'new').length);

  constructor() {
    this.store.load();
  }

  mark(inquiry: Inquiry, status: InquiryStatus): void {
    this.error.set(null);
    this.admin.setInquiryStatus(inquiry.id, status).subscribe({ error: (error: Error) => this.error.set(error.message) });
  }
}
