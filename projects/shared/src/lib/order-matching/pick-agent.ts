import { AssignmentRules } from '../config/trip.config';
import { Agent } from '../interfaces/agent.interface';
import { Order } from '../interfaces/order.interface';
import { normalisePlace } from './places';

type Request = Pick<Order, 'destination' | 'choice'>;

const isOpen = (order: Order): boolean => order.status === 'pending';

export const openRequestsOf = (agent: Agent, orders: Order[]): number =>
  orders.filter(order => isOpen(order) && order.agent === agent.username).length;

function knowsTheTrip(agent: Agent, request: Request): boolean {
  const destination = normalisePlace(request.destination);
  return agent.specialties.some(specialty => {
    const known = normalisePlace(specialty);
    return known === destination || known === normalisePlace(request.choice);
  });
}

/**
 * Scans the agents and the open requests and returns who should get the new order: the agent with the least
 * to do, with a head start for one who specialises in the trip. Agents who are away are skipped, unless nobody
 * is available, so a request is never left without an agent while an agent exists.
 */
export function pickAgent(agents: Agent[], orders: Order[], request: Request, rules: AssignmentRules, exclude: string[] = []): Agent | undefined {
  const eligible = agents.filter(agent => agent.active && !exclude.includes(agent.username));
  const available = eligible.filter(agent => agent.available);
  const candidates = available.length > 0 ? available : eligible;

  let best: Agent | undefined;
  let bestScore = Infinity;
  for (const agent of candidates) {
    const score = rules.loadWeight * openRequestsOf(agent, orders) - rules.specialtyWeight * (knowsTheTrip(agent, request) ? 1 : 0);
    if (score < bestScore) {
      best = agent;
      bestScore = score;
    }
  }
  return best;
}
