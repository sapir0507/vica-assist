import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigService, Message, MessageSender, Order } from '@vica-assist/shared';
import { environment } from 'src/environments/environment';

export interface MessageState {
  byOrder: Record<number, Message[]>;
}

const initialState: MessageState = {
  byOrder: {}
};

export const MessageStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(store => {
    const http = inject(HttpClient);
    const config = inject(ConfigService);
    const url = environment.api + 'messages';

    const add = (message: Message) => patchState(store, {
      byOrder: { ...store.byOrder(), [message.orderId]: [...(store.byOrder()[message.orderId] ?? []), message] }
    });

    const post = (orderId: number, from: MessageSender, author: string, text: string): Observable<Message> =>
      http.post<Message>(url, { orderId, from, author, text, sentAt: new Date().toISOString() }).pipe(tap(add));

    return {
      messagesOf(orderId: number): Message[] {
        return store.byOrder()[orderId] ?? [];
      },

      load(orderId: number): void {
        const params = new HttpParams().append('orderId', orderId);
        http.get<Message[]>(url, { params }).subscribe(messages => {
          patchState(store, { byOrder: { ...store.byOrder(), [orderId]: messages } });
        });
      },

      /** Only the customer who made the request and the agent who has it may write in its thread. */
      send(order: Order, from: Exclude<MessageSender, 'system'>, author: string, text: string): Observable<Message> {
        const body = text.trim();
        const max = config.config().limits.messageMaxLength;
        const owner = from === 'customer' ? order.customer : order.agent;
        if (!body) return throwError(() => new Error('Write a message first.'));
        if (body.length > max) return throwError(() => new Error(`Keep the message to ${max} characters or fewer.`));
        if (owner !== undefined && owner !== author) return throwError(() => new Error('You cannot write in this conversation.'));
        if (owner === undefined && from === 'customer') return throwError(() => new Error('You cannot write in this conversation.'));
        return post(order.id, from, author, body);
      },

      /** A line the app writes itself, such as "The customer changed this request". */
      note(orderId: number, text: string): Observable<Message> {
        return post(orderId, 'system', 'vica-assist', text);
      }
    };
  })
);
