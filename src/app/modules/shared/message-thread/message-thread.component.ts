import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ConfigService, Order } from '@vica-assist/shared';

import { MessageStore } from 'src/app/services/message/message.store';

@Component({
  standalone: true,
  selector: 'message-thread',
  templateUrl: './message-thread.component.html',
  styleUrls: ['./message-thread.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatButtonModule]
})
export class MessageThreadComponent {
  order = input.required<Order>();
  role = input.required<'customer' | 'agent'>();
  author = input.required<string>();

  private store = inject(MessageStore);
  private config = inject(ConfigService);

  readonly text = signal('');
  readonly error = signal<string | null>(null);
  readonly sending = signal(false);

  readonly messages = computed(() => this.store.byOrder()[this.order().id] ?? []);
  readonly maxLength = computed(() => this.config.config().limits.messageMaxLength);

  constructor() {
    effect(() => this.store.load(this.order().id));
  }

  readonly length = computed(() => this.text().trim().length);
  readonly canSend = computed(() => this.length() > 0 && this.length() <= this.maxLength() && !this.sending());

  send(): void {
    if (!this.canSend()) return;
    this.error.set(null);
    this.sending.set(true);
    this.store.send(this.order(), this.role(), this.author(), this.text()).subscribe({
      next: () => {
        this.text.set('');
        this.sending.set(false);
      },
      error: (error: Error) => {
        this.error.set(error.message);
        this.sending.set(false);
      }
    });
  }
}
