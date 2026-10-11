import { AssignmentRules } from '../config/trip.config';
import { Agent } from '../interfaces/agent.interface';
import { finalOrder } from '../interfaces/final-order.interface';
import { Order } from '../interfaces/order.interface';
import { AgentRating, agentRating } from './agent-rating';
import { isOverdue } from './plan-reassignments';

export interface AgentRow {
  agent: Agent;
  open: number;
  overdue: number;
  waitingForCustomer: number;
  booked: number;
  averageResponseHours: number | null;
  rating: AgentRating;
}

const HOUR_MS = 3_600_000;

/** One line per agent for the admin: what is on their desk, how fast they answer and what customers say. */
export function compareAgents(orders: Order[], bookings: finalOrder[], agents: Agent[], now: Date, rules: AssignmentRules): AgentRow[] {
  return [...agents]
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map(agent => {
      const mine = orders.filter(order => order.agent === agent.username);
      const booked = bookings.filter(booking => booking.order?.agent === agent.username);
      const hours = [...mine, ...booked.map(booking => booking.order as Order)]
        .map(order => (Date.parse(order.respondedAt ?? '') - Date.parse(order.createdAt ?? '')) / HOUR_MS)
        .filter(value => Number.isFinite(value) && value >= 0);

      return {
        agent,
        open: mine.filter(order => order.status === 'pending').length,
        overdue: mine.filter(order => order.status === 'pending' && isOverdue(order, now, rules)).length,
        waitingForCustomer: mine.filter(order => order.status === 'finished').length,
        booked: booked.length,
        averageResponseHours: hours.length ? Math.round((hours.reduce((sum, value) => sum + value, 0) / hours.length) * 10) / 10 : null,
        rating: agentRating(bookings, agent.username)
      };
    });
}
