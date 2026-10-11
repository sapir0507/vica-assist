import { finalOrder, Order } from '@vica-assist/shared';

export type RequestState = 'pending' | 'answered' | 'booked' | 'cancelled';

export interface TimelineStep {
  key: string;
  label: string;
  at?: string;
  done: boolean;
  current: boolean;
}

/** Where a request stands: a booking means it was chosen, otherwise the order's own status says. */
export function stateOf(order: Order | undefined, booking: finalOrder | undefined): RequestState | undefined {
  if (booking) return 'booked';
  if (!order) return undefined;
  if (order.status === 'cancelled') return 'cancelled';
  return order.status === 'finished' ? 'answered' : 'pending';
}

/** The steps a customer sees, each with the time it happened, and the first unfinished one marked as current. */
export function buildTimeline(order: Order, state: RequestState, bookedAt?: string): TimelineStep[] {
  if (state === 'cancelled') {
    return [
      { key: 'received', label: 'Request received', at: order.createdAt, done: true, current: false },
      { key: 'cancelled', label: 'Cancelled', at: order.cancelledAt, done: true, current: true }
    ];
  }

  const answered = state === 'answered' || state === 'booked';
  const steps: Omit<TimelineStep, 'current'>[] = [
    { key: 'received', label: 'Request received', at: order.createdAt, done: true },
    { key: 'assigned', label: 'Agent assigned', at: order.assignedAt ?? order.assignments?.[0]?.at, done: !!order.agent },
    { key: 'options', label: 'Options added', at: order.respondedAt, done: answered },
    { key: 'choose', label: 'You choose', done: state === 'booked' },
    { key: 'booked', label: 'Booked', at: bookedAt, done: state === 'booked' }
  ];
  const firstOpen = steps.findIndex(step => !step.done);
  return steps.map((step, index) => ({ ...step, current: index === firstOpen || (firstOpen === -1 && index === steps.length - 1) }));
}
