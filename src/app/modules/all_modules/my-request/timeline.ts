import { finalOrder, Order, OrderStatus } from '@vica-assist/shared';

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
  if (order.status === OrderStatus.Cancelled) return 'cancelled';
  return order.status === OrderStatus.Finished ? 'answered' : 'pending';
}

export const ORDER_STAGES = ['Request sent', 'Agent choosing options', 'Ready to confirm', 'Booked'] as const;

/** How far an open request has come, 1 to 4, for a progress bar: sent, agent assigned, options added, booked. */
export function orderStage(order: Order, booking: finalOrder | undefined): number {
  const state = stateOf(order, booking);
  if (state === 'booked') return 4;
  if (state === 'answered') return 3;
  return order.agent ? 2 : 1;
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
