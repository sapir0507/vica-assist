export type MessageSender = 'customer' | 'agent' | 'system';

export interface Message {
  id: number;
  orderId: number;
  from: MessageSender;
  author: string;
  text: string;
  sentAt: string;
}
