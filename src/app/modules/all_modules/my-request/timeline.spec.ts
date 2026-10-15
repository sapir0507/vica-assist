import { finalOrder, Order } from '@vica-assist/shared';

import { buildTimeline, orderStage, stateOf } from './timeline';

const order = (overrides: Partial<Order> = {}): Order => ({
  id: 1,
  orderID: '1',
  choice: 'both',
  status: 'pending',
  departureDate: '2026-12-01',
  returnDate: '2026-12-08',
  origin: 'Tel Aviv',
  destination: 'Paris', destinationId: 'paris',
  passDetails: [],
  priceRange: 1000,
  createdAt: '2026-10-01T09:00:00.000Z',
  agent: 'dana',
  assignedAt: '2026-10-01T09:00:01.000Z',
  ...overrides
});

describe('stateOf', () => {
  it('reads the state from the order and the booking', () => {
    expect(stateOf(order(), undefined)).toBe('pending');
    expect(stateOf(order({ status: 'finished' }), undefined)).toBe('answered');
    expect(stateOf(order({ status: 'cancelled' }), undefined)).toBe('cancelled');
    expect(stateOf(undefined, { id: 1 } as finalOrder)).toBe('booked');
    expect(stateOf(order({ status: 'finished' }), { id: 1 } as finalOrder)).toBe('booked');
    expect(stateOf(undefined, undefined)).toBeUndefined();
  });
});

describe('orderStage', () => {
  it('moves from sent to agent choosing, ready to confirm and booked', () => {
    expect(orderStage(order({ agent: undefined }), undefined)).toBe(1);
    expect(orderStage(order(), undefined)).toBe(2);
    expect(orderStage(order({ status: 'finished' }), undefined)).toBe(3);
    expect(orderStage(order({ status: 'finished' }), { id: 1 } as finalOrder)).toBe(4);
  });
});

describe('buildTimeline', () => {
  const keys = (steps: ReturnType<typeof buildTimeline>, field: 'done' | 'current') => steps.filter(s => s[field]).map(s => s.key);

  it('waits for the agent on a new request', () => {
    const steps = buildTimeline(order({ agent: undefined, assignedAt: undefined }), 'pending');

    expect(keys(steps, 'done')).toEqual(['received']);
    expect(keys(steps, 'current')).toEqual(['assigned']);
  });

  it('shows the assigned agent and waits for options', () => {
    const steps = buildTimeline(order(), 'pending');

    expect(keys(steps, 'done')).toEqual(['received', 'assigned']);
    expect(keys(steps, 'current')).toEqual(['options']);
    expect(steps[1].at).toBe('2026-10-01T09:00:01.000Z');
  });

  it('asks the customer to choose once the agent answered', () => {
    const steps = buildTimeline(order({ status: 'finished', respondedAt: '2026-10-02T10:00:00.000Z' }), 'answered');

    expect(keys(steps, 'done')).toEqual(['received', 'assigned', 'options']);
    expect(keys(steps, 'current')).toEqual(['choose']);
    expect(steps[2].at).toBe('2026-10-02T10:00:00.000Z');
  });

  it('is finished once booked, with the booking time on the last step', () => {
    const steps = buildTimeline(order({ status: 'finished' }), 'booked', '2026-10-03T08:00:00.000Z');

    expect(keys(steps, 'done')).toHaveLength(5);
    expect(keys(steps, 'current')).toEqual(['booked']);
    expect(steps[4].at).toBe('2026-10-03T08:00:00.000Z');
  });

  it('falls back to the first assignment time for older requests', () => {
    const steps = buildTimeline(order({ assignedAt: undefined, assignments: [{ agent: 'dana', at: 'then', reason: 'initial' }] }), 'pending');

    expect(steps[1].at).toBe('then');
  });

  it('ends at the cancellation for a cancelled request', () => {
    const steps = buildTimeline(order({ status: 'cancelled', cancelledAt: '2026-10-01T12:00:00.000Z' }), 'cancelled');

    expect(steps.map(s => s.key)).toEqual(['received', 'cancelled']);
    expect(steps[1]).toMatchObject({ at: '2026-10-01T12:00:00.000Z', current: true, done: true });
  });
});
