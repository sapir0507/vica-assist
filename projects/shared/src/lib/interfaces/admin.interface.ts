export interface AuditEntry {
  id: number;
  at: string;
  actor: string;
  action: string;
  detail: string;
}

export type InquiryStatus = 'new' | 'read' | 'answered';

export interface Inquiry {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  status: InquiryStatus;
}
