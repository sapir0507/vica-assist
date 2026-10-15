import { Destination, PublicSummary } from '@vica-assist/shared';

const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #818cf8, #4338ca)',
  'linear-gradient(135deg, #2dd4bf, #0f766e)',
  'linear-gradient(135deg, #f9a8d4, #be185d)',
  'linear-gradient(135deg, #fcd34d, #b45309)'
];

/** At least this many destinations need real bookings before the grid shows them instead of every destination we offer. */
const MIN_TRENDING = 3;

/**
 * The destinations to show visitors: the ones travelers actually chose, most popular first, dressed with the
 * art and facts of the matching destination; every destination we offer while there is not enough real data.
 */
export function trendingDestinations(summary: PublicSummary | null | undefined, destinations: Destination[]): Destination[] {
  const offered = destinations.filter(destination => destination.active);
  if (!summary?.sufficient || summary.topDestinations.length < MIN_TRENDING) return offered;

  return summary.topDestinations.map((place, index) => {
    const known = destinations.find(destination => destination.id === place.destinationId);
    const price = place.averagePrice === null ? '' : `, average trip about $${place.averagePrice}`;
    return {
      id: place.destinationId,
      name: place.name,
      emoji: known?.emoji ?? '📍',
      imageSrc: known?.imageSrc,
      description: known?.description ?? `Chosen by ${place.count} ${place.count === 1 ? 'traveler' : 'travelers'}`,
      fromPrice: known?.fromPrice ?? place.averagePrice ?? 0,
      gradient: known?.gradient ?? FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length],
      facts: known?.facts,
      active: known?.active ?? true,
      note: `Chosen by ${place.count} ${place.count === 1 ? 'traveler' : 'travelers'}${price}`
    };
  });
}
