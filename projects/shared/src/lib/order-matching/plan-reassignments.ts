import { AssignmentRules } from '../config/trip.config';
import { Agent, AssignmentReason } from '../interfaces/agent.interface';
import { Order } from '../interfaces/order.interface';
import { pickAgent } from './pick-agent';

export interface Reassignment {
  orderId: number;
  from: string;
  to: string;
  reason: Extract<AssignmentReason, 'overdue' | 'agent-unavailable'>;
}

const HOUR_MS = 3_600_000;

export function isOverdue(order: Order, now: Date, rules: AssignmentRules): boolean {
  const created = Date.parse(order.createdAt ?? '');
  return Number.isFinite(created) && now.getTime() - created > rules.responseHours * HOUR_MS;
}

/**
 * Which pending requests should move to another agent: those whose agent went away, and those nobody answered
 * within the promised time (once only, so a request is never passed around). Each move counts towards the new
 * agent's load before the next one is decided, so one agent does not receive them all.
 */
export function planReassignments(orders: Order[], agents: Agent[], now: Date, rules: AssignmentRules): Reassignment[] {
  const plans: Reassignment[] = [];
  let working = orders;

  for (const order of orders) {
    if (order.status !== 'pending' || !order.agent) continue;

    const owner = agents.find(agent => agent.username === order.agent);
    const away = !!owner && (!owner.available || !owner.active);
    const late = isOverdue(order, now, rules) && !(order.assignments ?? []).some(entry => entry.reason === 'overdue');
    if (!away && !late) continue;

    const next = pickAgent(agents.filter(agent => agent.available), working, order, rules, [order.agent]);
    if (!next) continue;

    plans.push({ orderId: order.id, from: order.agent, to: next.username, reason: away ? 'agent-unavailable' : 'overdue' });
    working = working.map(item => (item.id === order.id ? { ...item, agent: next.username } : item));
  }
  return plans;
}
