import { TripConfig } from '../config/trip.config';
import { isValidRating } from '../feedback';
import { Agent } from '../interfaces/agent.interface';
import { finalOrder } from '../interfaces/final-order.interface';
import { agentRating } from './agent-rating';
import { normalisePlace } from './places';

export interface PublicDestination {
  name: string;
  count: number;
  rating: number | null;
  averagePrice: number | null;
}

export interface PublicReview {
  firstName: string;
  destination: string;
  hotelRating?: number;
  flightRating?: number;
  text: string;
}

export interface PublicAgent {
  name: string;
  title: string;
  languages: string[];
  specialties: string[];
  rating: number | null;
  reviews: number;
}

/**
 * The only thing a visitor's browser reads about customers. It holds aggregates, first names and destinations;
 * never IDs, emails, budgets or order details, and nothing at all until there are enough bookings to hide anyone.
 */
export interface PublicSummary {
  id?: number;
  updatedAt: string;
  bookings: number;
  sufficient: boolean;
  averageRating: number | null;
  pleasedPercent: number | null;
  averageResponseHours: number | null;
  topDestinations: PublicDestination[];
  reviews: PublicReview[];
  agents: PublicAgent[];
  airlines: string[];
}

const MAX_DESTINATIONS = 6;
const MAX_REVIEWS = 12;
const HOUR_MS = 3_600_000;

const capitalise = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);
const round = (value: number, digits = 1): number => Math.round(value * 10 ** digits) / 10 ** digits;
const mean = (values: number[]): number | null => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null);
const ratingsOf = (booking: finalOrder): number[] => [booking.feedback?.hotelRating, booking.feedback?.flightRating].filter(isValidRating);
const priceOf = (booking: finalOrder): number | null => {
  const parts = [booking.hotel?.price, booking.flight?.price].filter((price): price is number => typeof price === 'number' && Number.isFinite(price) && price >= 0);
  return parts.length ? parts.reduce((sum, price) => sum + price, 0) : null;
};

export function buildPublicSummary(bookings: finalOrder[], agents: Agent[], config: TripConfig, now = new Date()): PublicSummary {
  const usable = bookings.filter(booking => booking.order);
  const sufficient = usable.length >= config.publicMinimum;
  const base = {
    updatedAt: now.toISOString(),
    bookings: usable.length,
    sufficient,
    agents: agents
      .filter(agent => agent.active)
      .map(agent => {
        const rating = agentRating(bookings, agent.username);
        return {
          name: agent.displayName,
          title: agent.title,
          languages: agent.languages,
          specialties: agent.specialties,
          rating: sufficient ? rating.average : null,
          reviews: sufficient ? rating.reviews : 0
        };
      }),
    airlines: config.airlines.filter(airline => airline.active).map(airline => airline.name)
  };
  if (!sufficient) {
    return { ...base, averageRating: null, pleasedPercent: null, averageResponseHours: null, topDestinations: [], reviews: [] };
  }

  const all = usable.flatMap(ratingsOf);
  const hours = usable
    .map(booking => (Date.parse(booking.order?.respondedAt ?? '') - Date.parse(booking.order?.createdAt ?? '')) / HOUR_MS)
    .filter(value => Number.isFinite(value) && value >= 0);

  const byPlace = new Map<string, finalOrder[]>();
  for (const booking of usable) {
    const key = normalisePlace(booking.order?.destination);
    if (key) byPlace.set(key, [...(byPlace.get(key) ?? []), booking]);
  }
  const topDestinations = [...byPlace.values()]
    .map(group => {
      const rating = mean(group.flatMap(ratingsOf));
      const price = mean(group.map(priceOf).filter((value): value is number => value !== null));
      return {
        name: capitalise(String(group[0].order?.destination).trim().toLowerCase()),
        count: group.length,
        rating: rating === null ? null : round(rating),
        averagePrice: price === null ? null : Math.round(price)
      };
    })
    .sort((a, b) => b.count - a.count || (b.rating ?? 0) - (a.rating ?? 0) || a.name.localeCompare(b.name))
    .slice(0, MAX_DESTINATIONS);

  const reviews = usable
    .filter(booking => !booking.feedback?.hidden && (booking.feedback?.review ?? '').trim() !== '')
    .sort((a, b) => Date.parse(b.feedback?.ratedAt ?? '') - Date.parse(a.feedback?.ratedAt ?? ''))
    .slice(0, MAX_REVIEWS)
    .map(booking => ({
      firstName: capitalise((booking.order?.passDetails[0]?.fullName ?? 'A traveler').trim().split(/\s+/)[0]),
      destination: capitalise(String(booking.order?.destination).trim().toLowerCase()),
      hotelRating: isValidRating(booking.feedback?.hotelRating) ? booking.feedback?.hotelRating : undefined,
      flightRating: isValidRating(booking.feedback?.flightRating) ? booking.feedback?.flightRating : undefined,
      text: (booking.feedback?.review ?? '').trim()
    }));

  const average = mean(all);
  return {
    ...base,
    averageRating: average === null ? null : round(average),
    pleasedPercent: all.length ? Math.round((all.filter(rating => rating >= 4).length / all.length) * 100) : null,
    averageResponseHours: hours.length ? round(mean(hours) as number) : null,
    topDestinations,
    reviews
  };
}
