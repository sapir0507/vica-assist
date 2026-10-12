import { TRIP_CONFIG_DEFAULTS, TripConfig } from '../config/trip.config';
import { Agent } from '../interfaces/agent.interface';
import { Feedback, finalOrder } from '../interfaces/final-order.interface';
import { buildPublicSummary } from './public-summary';

const config: TripConfig = { ...structuredClone(TRIP_CONFIG_DEFAULTS), publicMinimum: 3 };
const NOW = new Date('2026-10-11T12:00:00.000Z');

const agent = (username: string, overrides: Partial<Agent> = {}): Agent => ({
  id: 1, username, displayName: `${username} Cohen`, title: 'Agent', bio: 'private bio', languages: ['Hebrew'], specialties: ['Paris'], yearsExperience: 3,
  email: `${username}@private.example`, available: true, active: true, ...overrides
});

const booking = (id: number, destination: string, feedback?: Partial<Feedback>, extra: Partial<finalOrder> = {}, agentName = 'dana'): finalOrder => ({
  id,
  order: {
    id, orderID: `${id}`, choice: 'both', status: 'finished', departureDate: '', returnDate: '', origin: 'Tel Aviv', destination, agent: agentName,
    passDetails: [{ fullName: 'noa levi', passID: 123456782 }], priceRange: 1500, customer: 'secret-username', createdAt: '2026-10-01T08:00:00.000Z', respondedAt: '2026-10-01T12:00:00.000Z'
  },
  hotel: { id, price: 600 },
  flight: { id, price: 400 },
  feedback: feedback ? { ratedAt: `2026-10-0${id}T10:00:00.000Z`, ...feedback } : undefined,
  ...extra
});

const bookings = [
  booking(1, 'paris', { hotelRating: 5, flightRating: 4, review: 'Lovely hotel' }),
  booking(2, 'Paris ', { hotelRating: 4, flightRating: 2, review: ' Hidden gem ', hidden: true }),
  booking(3, 'rome', { hotelRating: 5 }),
  booking(4, 'Tokyo', { hotelRating: 3, flightRating: 5, review: 'Long flight' }, {}, 'noa')
];

describe('buildPublicSummary', () => {
  const summary = buildPublicSummary(bookings, [agent('dana'), agent('noa'), agent('gone', { active: false })], config, NOW);

  it('counts the bookings and averages the ratings', () => {
    expect(summary).toMatchObject({ bookings: 4, sufficient: true, averageRating: 4, pleasedPercent: 71, averageResponseHours: 4 });
    expect(summary.updatedAt).toBe(NOW.toISOString());
  });

  it('ranks destinations by bookings, combining spellings, with the average rating and price', () => {
    expect(summary.topDestinations[0]).toEqual({ name: 'Paris', count: 2, rating: 3.8, averagePrice: 1000 });
    expect(summary.topDestinations.map(d => d.name)).toEqual(['Paris', 'Rome', 'Tokyo']);
  });

  it('lists the written reviews newest first, by first name and destination, leaving out hidden ones', () => {
    expect(summary.reviews.map(r => r.text)).toEqual(['Long flight', 'Lovely hotel']);
    expect(summary.reviews[0]).toEqual({ firstName: 'Noa', destination: 'Tokyo', hotelRating: 3, flightRating: 5, text: 'Long flight' });
  });

  it('lists active agents with their rating, and the active airlines', () => {
    expect(summary.agents.map(a => a.name)).toEqual(['dana Cohen', 'noa Cohen']);
    expect(summary.agents[0]).toMatchObject({ rating: 4, reviews: 3, languages: ['Hebrew'] });
    expect(summary.airlines).toHaveLength(12);
  });

  it('never carries anything private: no emails, bios, IDs, customer names or prices of one booking', () => {
    const text = JSON.stringify(summary);

    expect(text).not.toContain('private');
    expect(text).not.toContain('secret-username');
    expect(text).not.toContain('123456782');
    expect(text).not.toContain('levi');
  });

  it('shows no numbers, destinations or reviews until there are enough bookings', () => {
    const small = buildPublicSummary(bookings.slice(0, 2), [agent('dana')], config, NOW);

    expect(small).toMatchObject({ bookings: 2, sufficient: false, averageRating: null, pleasedPercent: null, averageResponseHours: null, topDestinations: [], reviews: [] });
    expect(small.agents[0]).toMatchObject({ rating: null, reviews: 0 });
    expect(small.airlines.length).toBeGreaterThan(0);
  });

  it('skips bookings without an order and ignores invalid ratings and prices', () => {
    const messy = buildPublicSummary([
      ...bookings.slice(0, 3),
      { id: 9 } as finalOrder,
      booking(5, 'Lima', { hotelRating: 9, flightRating: 0 }, { hotel: { id: 5, price: -5 }, flight: undefined })
    ], [], config, NOW);

    expect(messy.bookings).toBe(4);
    expect(messy.topDestinations.find(d => d.name === 'Lima')).toEqual({ name: 'Lima', count: 1, rating: null, averagePrice: null });
  });

  it('caps the lists', () => {
    const many = Array.from({ length: 20 }, (_, i) => booking(i + 1, `place${i}`, { hotelRating: 5, review: `Review ${i}` }));

    const capped = buildPublicSummary(many, [], config, NOW);

    expect(capped.topDestinations).toHaveLength(6);
    expect(capped.reviews).toHaveLength(12);
  });

  it('uses "A traveler" when there is no passenger name', () => {
    const nameless = booking(1, 'Paris', { hotelRating: 5, review: 'Nice' });
    nameless.order!.passDetails = [];

    const reviews = buildPublicSummary([nameless, ...bookings.slice(1)], [], config, NOW).reviews;

    expect(reviews.find(r => r.text === 'Nice')?.firstName).toBe('A');
  });
});
