import { TRIP_CONFIG_DEFAULTS } from '../config/trip.config';
import { Agent } from '../interfaces/agent.interface';
import { Order } from '../interfaces/order.interface';
import { openRequestsOf, pickAgent } from './pick-agent';

const rules = TRIP_CONFIG_DEFAULTS.assignment;

const agent = (username: string, overrides: Partial<Agent> = {}): Agent => ({
  id: 1,
  username,
  displayName: username,
  title: 'Agent',
  bio: '',
  languages: [],
  specialties: [],
  yearsExperience: 1,
  email: `${username}@example.com`,
  available: true,
  active: true,
  ...overrides
});

let nextId = 1;
const order = (agentName: string | undefined, status = 'pending'): Order => ({
  id: nextId++,
  orderID: `o${nextId}`,
  choice: 'both',
  status,
  departureDate: '2026-12-01',
  returnDate: '2026-12-08',
  origin: 'Tel Aviv',
  destination: 'Paris', destinationId: 'paris',
  passDetails: [],
  priceRange: 1000,
  agent: agentName
});

const trip = { destination: 'Paris', choice: 'both' };

describe('pickAgent', () => {
  it('gives the order to the agent with the fewest open requests', () => {
    const agents = [agent('dana'), agent('noa'), agent('lee')];
    const orders = [order('dana'), order('dana'), order('noa'), order('lee'), order('lee'), order('lee')];

    expect(pickAgent(agents, orders, trip, rules)?.username).toBe('noa');
  });

  it('counts only pending requests, so answered and cancelled ones do not weigh an agent down', () => {
    const agents = [agent('dana'), agent('noa')];
    const orders = [order('dana', 'finished'), order('dana', 'cancelled'), order('noa')];

    expect(openRequestsOf(agents[0], orders)).toBe(0);
    expect(pickAgent(agents, orders, trip, rules)?.username).toBe('dana');
  });

  it('breaks a tie by list order', () => {
    expect(pickAgent([agent('dana'), agent('noa')], [], trip, rules)?.username).toBe('dana');
  });

  it('prefers a specialist for the destination when the load is the same', () => {
    const agents = [agent('dana'), agent('noa', { specialties: ['paris'] })];

    expect(pickAgent(agents, [], trip, rules)?.username).toBe('noa');
  });

  it('prefers a specialist for the trip type, ignoring case and accents', () => {
    const agents = [agent('dana'), agent('noa', { specialties: ['Hotel'] })];

    expect(pickAgent(agents, [], { destination: 'Zürich', choice: 'hotel' }, rules)?.username).toBe('noa');
  });

  it('lets a lighter load beat a specialist who is already busier by more than the head start', () => {
    const agents = [agent('dana'), agent('noa', { specialties: ['Paris'] })];
    const orders = [order('noa'), order('noa')];

    expect(pickAgent(agents, orders, trip, rules)?.username).toBe('dana');
  });

  it('skips agents who are away or inactive', () => {
    const agents = [agent('dana', { available: false }), agent('noa', { active: false }), agent('lee')];

    expect(pickAgent(agents, [], trip, rules)?.username).toBe('lee');
  });

  it('falls back to the agents who are away when nobody is available, but never to inactive ones', () => {
    const agents = [agent('dana', { available: false }), agent('noa', { active: false })];

    expect(pickAgent(agents, [], trip, rules)?.username).toBe('dana');
  });

  it('can leave someone out, for a reassignment', () => {
    const agents = [agent('dana'), agent('noa')];

    expect(pickAgent(agents, [], trip, rules, ['dana'])?.username).toBe('noa');
  });

  it('returns nothing when there is nobody to ask', () => {
    expect(pickAgent([], [], trip, rules)).toBeUndefined();
    expect(pickAgent([agent('dana', { active: false })], [], trip, rules)).toBeUndefined();
    expect(pickAgent([agent('dana')], [], trip, rules, ['dana'])).toBeUndefined();
  });

  it('ignores requests that were never assigned', () => {
    const agents = [agent('dana'), agent('noa')];

    expect(pickAgent(agents, [order(undefined), order(undefined)], trip, rules)?.username).toBe('dana');
  });
});
