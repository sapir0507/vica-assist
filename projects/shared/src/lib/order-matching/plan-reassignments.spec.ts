import { TRIP_CONFIG_DEFAULTS } from '../config/trip.config';
import { Agent } from '../interfaces/agent.interface';
import { Order } from '../interfaces/order.interface';
import { isOverdue, planReassignments } from './plan-reassignments';

const rules = { ...TRIP_CONFIG_DEFAULTS.assignment, responseHours: 24 };
const NOW = new Date('2026-10-11T12:00:00.000Z');
const hoursAgo = (hours: number) => new Date(NOW.getTime() - hours * 3_600_000).toISOString();

const agent = (username: string, overrides: Partial<Agent> = {}): Agent => ({
  id: 1,
  username,
  displayName: username,
  title: 'Agent',
  bio: '',
  languages: [],
  specialties: [],
  yearsExperience: 1,
  email: '',
  available: true,
  active: true,
  ...overrides
});

let nextId = 1;
const order = (overrides: Partial<Order> = {}): Order => ({
  id: nextId++,
  orderID: 'o',
  choice: 'both',
  status: 'pending',
  departureDate: '2026-12-01',
  returnDate: '2026-12-08',
  origin: 'Tel Aviv',
  destination: 'Paris', destinationId: 'paris',
  passDetails: [],
  priceRange: 1000,
  agent: 'dana',
  createdAt: hoursAgo(1),
  ...overrides
});

const agents = [agent('dana'), agent('noa'), agent('lee')];

describe('isOverdue', () => {
  it('is true only after the promised time', () => {
    expect(isOverdue(order({ createdAt: hoursAgo(25) }), NOW, rules)).toBe(true);
    expect(isOverdue(order({ createdAt: hoursAgo(23) }), NOW, rules)).toBe(false);
  });

  it('is false when the request has no readable creation time', () => {
    expect(isOverdue(order({ createdAt: undefined }), NOW, rules)).toBe(false);
    expect(isOverdue(order({ createdAt: 'earlier' }), NOW, rules)).toBe(false);
  });
});

describe('planReassignments', () => {
  it('moves an overdue request to another available agent', () => {
    const late = order({ createdAt: hoursAgo(30) });

    const plans = planReassignments([late], agents, NOW, rules);

    expect(plans).toEqual([{ orderId: late.id, from: 'dana', to: 'noa', reason: 'overdue' }]);
  });

  it('does not move an overdue request twice', () => {
    const late = order({ createdAt: hoursAgo(80), assignments: [{ agent: 'noa', at: hoursAgo(50), reason: 'overdue' }], agent: 'noa' });

    expect(planReassignments([late], agents, NOW, rules)).toEqual([]);
  });

  it('leaves requests alone that are on time, answered or cancelled', () => {
    const orders = [order(), order({ status: 'finished', createdAt: hoursAgo(90) }), order({ status: 'cancelled', createdAt: hoursAgo(90) })];

    expect(planReassignments(orders, agents, NOW, rules)).toEqual([]);
  });

  it('moves the pending requests of an agent who went away, even when they are not late', () => {
    const away = [agent('dana', { available: false }), agent('noa'), agent('lee')];
    const first = order();

    const plans = planReassignments([first], away, NOW, rules);

    expect(plans).toEqual([{ orderId: first.id, from: 'dana', to: 'noa', reason: 'agent-unavailable' }]);
  });

  it('treats a deactivated agent like one who is away', () => {
    const gone = [agent('dana', { active: false }), agent('noa')];

    expect(planReassignments([order()], gone, NOW, rules)[0]).toMatchObject({ to: 'noa', reason: 'agent-unavailable' });
  });

  it('spreads several moves over the agents instead of piling them on one', () => {
    const away = [agent('dana', { available: false }), agent('noa'), agent('lee')];
    const orders = [order(), order(), order(), order()];

    const targets = planReassignments(orders, away, NOW, rules).map(plan => plan.to);

    expect(targets).toEqual(['noa', 'lee', 'noa', 'lee']);
  });

  it('does nothing when nobody else is available', () => {
    const alone = [agent('dana', { available: false })];

    expect(planReassignments([order()], alone, NOW, rules)).toEqual([]);
    expect(planReassignments([order({ createdAt: hoursAgo(30) })], [agent('dana')], NOW, rules)).toEqual([]);
  });

  it('ignores requests that were never assigned', () => {
    expect(planReassignments([order({ agent: undefined, createdAt: hoursAgo(90) })], agents, NOW, rules)).toEqual([]);
  });

  it('uses the promised time from the rules', () => {
    const tight = { ...rules, responseHours: 2 };

    expect(planReassignments([order({ createdAt: hoursAgo(3) })], agents, NOW, tight)).toHaveLength(1);
    expect(planReassignments([order({ createdAt: hoursAgo(1) })], agents, NOW, tight)).toEqual([]);
  });
});
