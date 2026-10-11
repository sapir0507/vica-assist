import { bookedParts, finalOrder, hasTripEnded, isValidRating, Order, RatedPart } from '@vica-assist/shared';

export interface PartSatisfaction {
  count: number;
  average: number | null;
  satisfiedPercent: number | null;
  /** Number of ratings for 1, 2, 3, 4 and 5 stars. */
  distribution: number[];
}

export interface Review {
  destination: string;
  review: string;
  hotelRating?: number;
  flightRating?: number;
  ratedAt: string;
}

export interface Count {
  label: string;
  count: number;
}

export interface Insights {
  funnel: { received: number; awaiting: number; waitingForCustomer: number; booked: number; bookingRate: number | null };
  satisfaction: {
    eligible: number;
    reviewedEligible: number;
    responseRate: number | null;
    hotel: PartSatisfaction;
    flight: PartSatisfaction;
    latestReviews: Review[];
  };
  business: {
    averageResponseHours: number | null;
    responseSample: number;
    totalBookedValue: number;
    averageBudgetUsedPercent: number | null;
    topDestinations: Count[];
    tripTypes: Count[];
    bookingsPerMonth: Count[];
  };
  /** Bookings with at least one field that could not be used, left out of the statistic that needed it. */
  ignored: number;
}

const MAX_REVIEWS = 5;
const MAX_DESTINATIONS = 5;
const MAX_MONTHS = 12;
const TRIP_TYPE_LABELS: Record<string, string> = { both: 'Flight and hotel', hotel: 'Hotel only', flight: 'Flight only' };

const isMoney = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const time = (value: string | undefined): number => (value ? Date.parse(value) : NaN);
const round = (value: number, digits = 1): number => Math.round(value * 10 ** digits) / 10 ** digits;
const percent = (part: number, whole: number): number | null => (whole > 0 ? Math.round((part / whole) * 100) : null);
const average = (values: number[]): number | null => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);
const capitalise = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

function summarise(ratings: number[]): PartSatisfaction {
  const distribution = [1, 2, 3, 4, 5].map(star => ratings.filter(rating => rating === star).length);
  const mean = average(ratings);
  return {
    count: ratings.length,
    average: mean === null ? null : round(mean),
    satisfiedPercent: percent(ratings.filter(rating => rating >= 4).length, ratings.length),
    distribution
  };
}

function tally(labels: string[]): Count[] {
  const counts = new Map<string, number>();
  labels.forEach(label => counts.set(label, (counts.get(label) ?? 0) + 1));
  return [...counts].map(([label, count]) => ({ label, count }));
}

function validRatings(booking: finalOrder, part: RatedPart): number[] {
  if (!bookedParts(booking.order?.choice).includes(part)) return [];
  const rating = booking.feedback?.[`${part}Rating`];
  return isValidRating(rating) ? [rating] : [];
}

function hasProblem(booking: finalOrder): boolean {
  const feedback = booking.feedback;
  const badRating = [feedback?.hotelRating, feedback?.flightRating].some(rating => rating !== undefined && !isValidRating(rating));
  const badPrice = [booking.hotel?.price, booking.flight?.price].some(price => price !== undefined && !isMoney(price));
  return !booking.order || badRating || badPrice;
}

/** Turns the orders and bookings the agent can see into the numbers on the Insights tab. Never throws on bad records. */
export function computeInsights(orders: Order[], bookings: finalOrder[], now = new Date()): Insights {
  const usable = bookings.filter(booking => booking.order);
  const awaiting = orders.filter(order => order.status !== 'finished').length;
  const waitingForCustomer = orders.length - awaiting;
  const received = orders.length + usable.length;

  const eligible = usable.filter(booking => hasTripEnded(booking.order?.returnDate, now));
  const reviewedEligible = eligible.filter(booking =>
    bookedParts(booking.order?.choice).some(part => validRatings(booking, part).length > 0)
  );

  const reviews = usable
    .filter(booking => (booking.feedback?.review ?? '').trim() !== '')
    .map(booking => ({
      destination: capitalise((booking.order?.destination ?? '').trim()),
      review: (booking.feedback?.review ?? '').trim(),
      hotelRating: validRatings(booking, 'hotel')[0],
      flightRating: validRatings(booking, 'flight')[0],
      ratedAt: booking.feedback?.ratedAt ?? ''
    }))
    .sort((a, b) => (time(b.ratedAt) || 0) - (time(a.ratedAt) || 0))
    .slice(0, MAX_REVIEWS);

  const answeredOrders = [...orders, ...usable.map(booking => booking.order as Order)];
  const responseHours = answeredOrders
    .map(order => (time(order.respondedAt) - time(order.createdAt)) / 3_600_000)
    .filter(hours => Number.isFinite(hours) && hours >= 0);

  const totals = usable.map(booking => ({
    total: [booking.hotel?.price, booking.flight?.price].filter(isMoney).reduce((sum, price) => sum + price, 0),
    budget: booking.order?.priceRange
  }));
  const budgetShares = totals.filter(item => isMoney(item.budget) && item.budget > 0 && item.total > 0)
    .map(item => (item.total / (item.budget as number)) * 100);

  const months = tally(
    usable
      .map(booking => new Date(time(booking.bookedAt)))
      .filter(date => !Number.isNaN(date.getTime()))
      .map(date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
  ).sort((a, b) => a.label.localeCompare(b.label)).slice(-MAX_MONTHS);

  const allChoices = [...orders, ...usable.map(booking => booking.order as Order)].map(order => order.choice);

  return {
    funnel: { received, awaiting, waitingForCustomer, booked: usable.length, bookingRate: percent(usable.length, received) },
    satisfaction: {
      eligible: eligible.length,
      reviewedEligible: reviewedEligible.length,
      responseRate: percent(reviewedEligible.length, eligible.length),
      hotel: summarise(usable.flatMap(booking => validRatings(booking, 'hotel'))),
      flight: summarise(usable.flatMap(booking => validRatings(booking, 'flight'))),
      latestReviews: reviews
    },
    business: {
      averageResponseHours: responseHours.length ? round(average(responseHours) as number) : null,
      responseSample: responseHours.length,
      totalBookedValue: totals.reduce((sum, item) => sum + item.total, 0),
      averageBudgetUsedPercent: budgetShares.length ? Math.round(average(budgetShares) as number) : null,
      topDestinations: tally(usable.map(booking => capitalise((booking.order?.destination ?? '').trim().toLowerCase())).filter(Boolean))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
        .slice(0, MAX_DESTINATIONS),
      tripTypes: tally(allChoices.filter(choice => choice in TRIP_TYPE_LABELS).map(choice => TRIP_TYPE_LABELS[choice]))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
      bookingsPerMonth: months
    },
    ignored: bookings.filter(hasProblem).length
  };
}
