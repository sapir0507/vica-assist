import { TRIP_CONFIG_DEFAULTS } from '../config/trip.config';
import { Agent } from '../interfaces/agent.interface';
import { finalOrder } from '../interfaces/final-order.interface';
import { Order } from '../interfaces/order.interface';
import { compareAgents } from './agent-comparison';

const rules = TRIP_CONFIG_DEFAULTS.assignment;
const NOW = new Date('2026-10-11T12:00:00.000Z');
const hoursAgo = (hours: number) => new Date(NOW.getTime() - hours * 3_600_000).toISOString();

const agent = (username: string, displayName: string): Agent => ({
  id: 1, username, displayName, title: '', bio: '', languages: [], specialties: [], yearsExperience: 1, email: '', available: true, active: true
});

const order = (overrides: Partial<Order>): Order => ({
  id: 1, orderID: '1', choice: 'both', status: 'pending', departureDate: '', returnDate: '', origin: '', destination: '', destinationId: 'paris', passDetails: [], priceRange: 0, ...overrides
});

describe('compareAgents', () => {
  const agents = [agent('noa', 'Noa Katz'), agent('dana', 'Dana Levi')];

  it('lists the agents by name, with nothing on their desk when there is no work', () => {
    const rows = compareAgents([], [], agents, NOW, rules);

    expect(rows.map(row => row.agent.username)).toEqual(['dana', 'noa']);
    expect(rows[0]).toMatchObject({ open: 0, overdue: 0, waitingForCustomer: 0, booked: 0, averageResponseHours: null });
    expect(rows[0].rating.average).toBeNull();
  });

  it('counts open, overdue and answered requests per agent', () => {
    const orders = [
      order({ id: 1, agent: 'dana', createdAt: hoursAgo(2) }),
      order({ id: 2, agent: 'dana', createdAt: hoursAgo(40) }),
      order({ id: 3, agent: 'dana', status: 'finished', createdAt: hoursAgo(50), respondedAt: hoursAgo(48) }),
      order({ id: 4, agent: 'noa', status: 'cancelled' }),
      order({ id: 5 })
    ];

    const [dana, noa] = compareAgents(orders, [], agents, NOW, rules);

    expect(dana).toMatchObject({ open: 2, overdue: 1, waitingForCustomer: 1 });
    expect(noa).toMatchObject({ open: 0, overdue: 0, waitingForCustomer: 0 });
  });

  it('counts bookings and rates the agent from them', () => {
    const bookings: finalOrder[] = [
      { id: 1, order: order({ agent: 'dana', createdAt: hoursAgo(10), respondedAt: hoursAgo(6) }), feedback: { hotelRating: 5, flightRating: 3, ratedAt: 'x' } },
      { id: 2, order: order({ agent: 'noa' }) },
      { id: 3 } as finalOrder
    ];

    const [dana, noa] = compareAgents([], bookings, agents, NOW, rules);

    expect(dana.booked).toBe(1);
    expect(dana.rating).toEqual({ reviews: 1, average: 4, pleasedPercent: 50 });
    expect(noa.booked).toBe(1);
    expect(noa.rating.reviews).toBe(0);
  });

  it('averages how long an agent takes to answer, across answered requests and bookings', () => {
    const orders = [order({ agent: 'dana', status: 'finished', createdAt: hoursAgo(10), respondedAt: hoursAgo(8) })];
    const bookings: finalOrder[] = [{ id: 1, order: order({ agent: 'dana', createdAt: hoursAgo(20), respondedAt: hoursAgo(14) }) }];

    const [dana] = compareAgents(orders, bookings, agents, NOW, rules);

    expect(dana.averageResponseHours).toBe(4);
  });

  it('ignores answers that come before the question or have unreadable times', () => {
    const orders = [
      order({ agent: 'dana', createdAt: hoursAgo(5), respondedAt: hoursAgo(9) }),
      order({ agent: 'dana', createdAt: 'x', respondedAt: 'y' })
    ];

    expect(compareAgents(orders, [], agents, NOW, rules)[0].averageResponseHours).toBeNull();
  });
});
