import { normalisePlace, PublicSummary } from '@vica-assist/shared';

export interface DestinationFacts {
  bestSeason: string;
  flightTime: string;
  language: string;
  currency: string;
}

export interface Destination {
  name: string;
  emoji: string;
  description: string;
  fromPrice: number;
  gradient: string;
  facts?: DestinationFacts;
  /** Shown instead of the "flights from" line, for destinations built from real bookings. */
  note?: string;
}

export const DESTINATIONS: readonly Destination[] = [
  { name: 'Paris', emoji: '🗼', description: 'Cafés, museums and the river Seine', fromPrice: 420, gradient: 'linear-gradient(135deg, #f472b6, #7c3aed)', facts: { bestSeason: 'April to June', flightTime: 'about 4.5 hours', language: 'French', currency: 'Euro' } },
  { name: 'Tokyo', emoji: '🗾', description: 'Neon nights and quiet temples', fromPrice: 780, gradient: 'linear-gradient(135deg, #fb7185, #be123c)', facts: { bestSeason: 'March to May and October to November', flightTime: 'about 12 hours with a stop', language: 'Japanese', currency: 'Yen' } },
  { name: 'Bali', emoji: '🌴', description: 'Rice terraces and surf beaches', fromPrice: 690, gradient: 'linear-gradient(135deg, #34d399, #0e7490)', facts: { bestSeason: 'April to October', flightTime: 'about 12 hours with a stop', language: 'Indonesian', currency: 'Rupiah' } },
  { name: 'Dubai', emoji: '🏙️', description: 'Skyscrapers, desert and souks', fromPrice: 360, gradient: 'linear-gradient(135deg, #fbbf24, #b45309)', facts: { bestSeason: 'November to March', flightTime: 'about 4.5 hours', language: 'Arabic and English', currency: 'Dirham' } },
  { name: 'Barcelona', emoji: '⛪', description: 'Gaudí, tapas and the sea', fromPrice: 310, gradient: 'linear-gradient(135deg, #fb923c, #c2410c)', facts: { bestSeason: 'May, June and September', flightTime: 'about 5 hours', language: 'Spanish and Catalan', currency: 'Euro' } },
  { name: 'Singapore', emoji: '🦁', description: 'Gardens, food courts and skyline', fromPrice: 740, gradient: 'linear-gradient(135deg, #38bdf8, #4338ca)', facts: { bestSeason: 'February to April', flightTime: 'about 9.5 hours', language: 'English, Malay, Mandarin and Tamil', currency: 'Singapore dollar' } }
];

const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #818cf8, #4338ca)',
  'linear-gradient(135deg, #2dd4bf, #0f766e)',
  'linear-gradient(135deg, #f9a8d4, #be185d)',
  'linear-gradient(135deg, #fcd34d, #b45309)'
];

/** At least this many destinations need real bookings before the grid shows them instead of the sample six. */
const MIN_TRENDING = 3;

/**
 * The destinations to show visitors: the ones travelers actually chose, most popular first, dressed with the
 * sample art and facts when we have them; the sample six while there is not enough real data.
 */
export function trendingDestinations(summary: PublicSummary | null | undefined): Destination[] {
  if (!summary?.sufficient || summary.topDestinations.length < MIN_TRENDING) return [...DESTINATIONS];

  return summary.topDestinations.map((place, index) => {
    const known = DESTINATIONS.find(destination => normalisePlace(destination.name) === normalisePlace(place.name));
    const price = place.averagePrice === null ? '' : `, average trip about $${place.averagePrice}`;
    return {
      name: place.name,
      emoji: known?.emoji ?? '📍',
      description: known?.description ?? `Chosen by ${place.count} ${place.count === 1 ? 'traveler' : 'travelers'}`,
      fromPrice: known?.fromPrice ?? place.averagePrice ?? 0,
      gradient: known?.gradient ?? FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length],
      facts: known?.facts,
      note: `Chosen by ${place.count} ${place.count === 1 ? 'traveler' : 'travelers'}${price}`
    };
  });
}
