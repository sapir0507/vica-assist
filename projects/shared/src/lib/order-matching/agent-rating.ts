import { isValidRating } from '../feedback';
import { finalOrder } from '../interfaces/final-order.interface';

export interface AgentRating {
  /** Number of bookings of this agent that were rated. */
  reviews: number;
  /** Average of every valid hotel and flight rating, one decimal; `null` before the first rating. */
  average: number | null;
  /** Share of ratings that are 4 or 5 stars. */
  pleasedPercent: number | null;
}

/** What customers think of one agent, from the ratings on the bookings that agent handled. */
export function agentRating(bookings: finalOrder[], username: string): AgentRating {
  const ratings: number[] = [];
  let reviews = 0;

  for (const booking of bookings) {
    if (booking.order?.agent !== username || !booking.feedback) continue;
    const valid = [booking.feedback.hotelRating, booking.feedback.flightRating].filter(isValidRating);
    if (valid.length === 0) continue;
    reviews++;
    ratings.push(...valid);
  }

  if (ratings.length === 0) return { reviews: 0, average: null, pleasedPercent: null };
  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return {
    reviews,
    average: Math.round((total / ratings.length) * 10) / 10,
    pleasedPercent: Math.round((ratings.filter(rating => rating >= 4).length / ratings.length) * 100)
  };
}
