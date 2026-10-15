import { Feedback } from '../interfaces/final-order.interface';
import { finalOrder } from '../interfaces/final-order.interface';
import { agentRating } from './agent-rating';

const booking = (agent: string | undefined, feedback?: Partial<Feedback>): finalOrder => ({
  id: 1,
  order: { id: 1, orderID: '1', choice: 'both', status: 'finished', departureDate: '', returnDate: '', origin: '', destination: '', destinationId: 'paris', passDetails: [], priceRange: 0, agent },
  feedback: feedback ? { ratedAt: '2026-01-01T00:00:00.000Z', ...feedback } : undefined
});

describe('agentRating', () => {
  it('averages every rating of the agent\'s bookings and counts the reviewed bookings', () => {
    const result = agentRating([
      booking('dana', { hotelRating: 5, flightRating: 4 }),
      booking('dana', { hotelRating: 2 }),
      booking('noa', { hotelRating: 1 })
    ], 'dana');

    expect(result).toEqual({ reviews: 2, average: 3.7, pleasedPercent: 67 });
  });

  it('is empty before anyone has rated this agent', () => {
    expect(agentRating([booking('dana'), booking('noa', { hotelRating: 5 })], 'dana')).toEqual({ reviews: 0, average: null, pleasedPercent: null });
    expect(agentRating([], 'dana')).toEqual({ reviews: 0, average: null, pleasedPercent: null });
  });

  it('skips ratings that are not 1 to 5 and bookings without an order', () => {
    const result = agentRating([
      booking('dana', { hotelRating: 9, flightRating: 5 }),
      booking('dana', { hotelRating: 0 }),
      { id: 2 } as finalOrder
    ], 'dana');

    expect(result).toEqual({ reviews: 1, average: 5, pleasedPercent: 100 });
  });
});
