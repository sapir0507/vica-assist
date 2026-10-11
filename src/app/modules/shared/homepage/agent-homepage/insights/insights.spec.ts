import { Feedback, finalOrder, Order } from '@vica-assist/shared';

import { computeInsights } from './insights';

const NOW = new Date(2026, 9, 11, 12, 0);

const order = (id: number, overrides: Partial<Order> = {}): Order => ({
  id,
  orderID: `o-${id}`,
  choice: 'both',
  status: 'pending',
  departureDate: '2026-03-01',
  returnDate: '2026-03-08',
  origin: 'Tel Aviv',
  destination: 'Paris',
  passDetails: [],
  priceRange: 1000,
  ...overrides
});

const booking = (
  id: number,
  overrides: Partial<Order> = {},
  extra: Partial<finalOrder> = {}
): finalOrder => ({
  id,
  order: order(id, { status: 'finished', ...overrides }),
  hotel: { id, price: 400 },
  flight: { id, price: 200 },
  bookedAt: '2026-03-01T10:00:00.000Z',
  ...extra
});

const feedback = (hotelRating?: number, flightRating?: number, review?: string, ratedAt = '2026-03-10T10:00:00.000Z'): Feedback => ({
  hotelRating,
  flightRating,
  review,
  ratedAt
});

describe('computeInsights', () => {
  describe('with no data', () => {
    const insights = computeInsights([], [], NOW);

    it('reports zeros and no percentages instead of NaN', () => {
      expect(insights.funnel).toEqual({ received: 0, awaiting: 0, waitingForCustomer: 0, booked: 0, cancelled: 0, bookingRate: null });
      expect(insights.satisfaction.hotel).toEqual({ count: 0, average: null, satisfiedPercent: null, distribution: [0, 0, 0, 0, 0] });
      expect(insights.satisfaction.responseRate).toBeNull();
      expect(insights.business.averageResponseHours).toBeNull();
      expect(insights.business.averageBudgetUsedPercent).toBeNull();
      expect(insights.business.totalBookedValue).toBe(0);
      expect(insights.business.topDestinations).toEqual([]);
      expect(insights.ignored).toBe(0);
    });
  });

  describe('funnel', () => {
    it('splits requests into awaiting the agent, waiting for the customer and booked', () => {
      const { funnel } = computeInsights(
        [order(1), order(2), order(3, { status: 'finished' })],
        [booking(4), booking(5)],
        NOW
      );

      expect(funnel).toEqual({ received: 5, awaiting: 2, waitingForCustomer: 1, booked: 2, cancelled: 0, bookingRate: 40 });
    });

    it('counts cancelled requests on their own, not as waiting for an agent', () => {
      const { funnel } = computeInsights([order(1), order(2, { status: 'cancelled' })], [], NOW);

      expect(funnel).toMatchObject({ received: 2, awaiting: 1, cancelled: 1 });
    });
  });

  describe('satisfaction', () => {
    const bookings = [
      booking(1, {}, { feedback: feedback(5, 4, 'Loved it', '2026-03-10T10:00:00.000Z') }),
      booking(2, { choice: 'hotel' }, { feedback: feedback(3, undefined, 'Okay', '2026-04-10T10:00:00.000Z') }),
      booking(3, { choice: 'flight' }, { feedback: feedback(undefined, 2, undefined) }),
      booking(4),
      booking(5, { returnDate: '2999-01-01' })
    ];
    const { satisfaction } = computeInsights([], bookings, NOW);

    it('averages the ratings of every part that was booked and rated', () => {
      expect(satisfaction.hotel).toMatchObject({ count: 2, average: 4, satisfiedPercent: 50, distribution: [0, 0, 1, 0, 1] });
      expect(satisfaction.flight).toMatchObject({ count: 2, average: 3, satisfiedPercent: 50, distribution: [0, 1, 0, 1, 0] });
    });

    it('measures how many finished trips were reviewed, ignoring trips still to come', () => {
      expect(satisfaction.eligible).toBe(4);
      expect(satisfaction.reviewedEligible).toBe(3);
      expect(satisfaction.responseRate).toBe(75);
    });

    it('lists the written reviews, newest first', () => {
      expect(satisfaction.latestReviews.map(r => r.review)).toEqual(['Okay', 'Loved it']);
      expect(satisfaction.latestReviews[0]).toMatchObject({ destination: 'Paris', hotelRating: 3 });
    });

    it('keeps only the five latest reviews', () => {
      const many = Array.from({ length: 7 }, (_, i) =>
        booking(i + 1, {}, { feedback: feedback(5, 5, `Review ${i}`, `2026-03-0${i + 1}T10:00:00.000Z`) })
      );

      const { latestReviews } = computeInsights([], many, NOW).satisfaction;

      expect(latestReviews).toHaveLength(5);
      expect(latestReviews[0].review).toBe('Review 6');
    });

    it('ignores ratings for parts that were not booked', () => {
      const hotelOnly = booking(1, { choice: 'hotel' }, { feedback: feedback(4, 1) });

      const result = computeInsights([], [hotelOnly], NOW).satisfaction;

      expect(result.flight.count).toBe(0);
      expect(result.hotel.count).toBe(1);
    });
  });

  describe('business', () => {
    it('sums what was booked and shows how much of the budget it used', () => {
      const { business } = computeInsights([], [
        booking(1, { priceRange: 1000 }, { hotel: { id: 1, price: 500 }, flight: { id: 1, price: 300 } }),
        booking(2, { priceRange: 500 }, { hotel: { id: 2, price: 250 }, flight: undefined })
      ], NOW);

      expect(business.totalBookedValue).toBe(1050);
      expect(business.averageBudgetUsedPercent).toBe(65);
    });

    it('averages the time agents took to respond, across requests and bookings', () => {
      const { business } = computeInsights(
        [order(1, { status: 'finished', createdAt: '2026-03-01T08:00:00.000Z', respondedAt: '2026-03-01T10:00:00.000Z' })],
        [booking(2, { createdAt: '2026-03-01T08:00:00.000Z', respondedAt: '2026-03-01T14:00:00.000Z' })],
        NOW
      );

      expect(business.averageResponseHours).toBe(4);
      expect(business.responseSample).toBe(2);
    });

    it('ranks destinations ignoring case and spelling of whitespace, and caps the list', () => {
      const names = ['paris', 'Paris ', 'rome', 'Rome', 'rome', 'lima', 'oslo', 'bern', 'kyiv'];
      const { business } = computeInsights([], names.map((name, i) => booking(i + 1, { destination: name })), NOW);

      expect(business.topDestinations.slice(0, 2)).toEqual([{ label: 'Rome', count: 3 }, { label: 'Paris', count: 2 }]);
      expect(business.topDestinations).toHaveLength(5);
    });

    it('splits all requests by trip type', () => {
      const { business } = computeInsights(
        [order(1, { choice: 'hotel' })],
        [booking(2, { choice: 'both' }), booking(3, { choice: 'both' })],
        NOW
      );

      expect(business.tripTypes).toEqual([{ label: 'Flight and hotel', count: 2 }, { label: 'Hotel only', count: 1 }]);
    });

    it('counts bookings per month in calendar order', () => {
      const { business } = computeInsights([], [
        booking(1, {}, { bookedAt: '2026-05-10T12:00:00.000Z' }),
        booking(2, {}, { bookedAt: '2026-03-10T12:00:00.000Z' }),
        booking(3, {}, { bookedAt: '2026-05-20T12:00:00.000Z' })
      ], NOW);

      expect(business.bookingsPerMonth).toEqual([{ label: '2026-03', count: 1 }, { label: '2026-05', count: 2 }]);
    });
  });

  describe('malformed records', () => {
    it('skips a booking without an order everywhere and counts it as ignored', () => {
      const insights = computeInsights([], [{ id: 1 } as finalOrder, booking(2)], NOW);

      expect(insights.funnel.booked).toBe(1);
      expect(insights.ignored).toBe(1);
    });

    it('does not use ratings outside 1 to 5, but still uses the rest of the booking', () => {
      const insights = computeInsights([], [booking(1, {}, { feedback: feedback(9, 4) })], NOW);

      expect(insights.satisfaction.hotel.count).toBe(0);
      expect(insights.satisfaction.flight.count).toBe(1);
      expect(insights.funnel.booked).toBe(1);
      expect(insights.ignored).toBe(1);
    });

    it('does not add negative or non-numeric prices to the totals', () => {
      const insights = computeInsights([], [
        booking(1, {}, { hotel: { id: 1, price: -50 }, flight: { id: 1, price: 200 } }),
        booking(2, {}, { hotel: { id: 2, price: 'cheap' as unknown as number }, flight: { id: 2, price: 100 } })
      ], NOW);

      expect(insights.business.totalBookedValue).toBe(300);
      expect(insights.ignored).toBe(2);
    });

    it('does not use unparsable dates or an answer before the question', () => {
      const insights = computeInsights([], [
        booking(1, { createdAt: 'yesterday-ish', respondedAt: '2026-03-01T10:00:00.000Z' }, { bookedAt: 'whenever' }),
        booking(2, { createdAt: '2026-03-02T10:00:00.000Z', respondedAt: '2026-03-01T10:00:00.000Z' }),
        booking(3, { returnDate: 'soon' })
      ], NOW);

      expect(insights.business.averageResponseHours).toBeNull();
      expect(insights.business.bookingsPerMonth).toEqual([{ label: '2026-03', count: 2 }]);
      expect(insights.satisfaction.eligible).toBe(2);
    });

    it('ignores a booking with an unknown trip type in the split and a zero budget in the share', () => {
      const insights = computeInsights([], [booking(1, { choice: 'cruise', priceRange: 0 })], NOW);

      expect(insights.business.tripTypes).toEqual([]);
      expect(insights.business.averageBudgetUsedPercent).toBeNull();
    });

    it('never produces NaN anywhere', () => {
      const insights = computeInsights(
        [order(1, { createdAt: 'x', respondedAt: 'y', priceRange: NaN })],
        [booking(2, { priceRange: NaN }, { hotel: { id: 1, price: NaN }, flight: undefined, feedback: feedback(NaN, 0) })],
        NOW
      );

      const text = JSON.stringify(insights, (_key, value) => (typeof value === 'number' && Number.isNaN(value) ? 'NaN' : value));
      expect(text).not.toContain('NaN');
    });
  });
});
