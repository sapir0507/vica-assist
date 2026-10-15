import { PublicSummary } from '@vica-assist/shared';

import { trendingDestinations } from './destinations';
import { DESTINATIONS } from './destinations.testing';

const summary = (overrides: Partial<PublicSummary> = {}): PublicSummary => ({
  updatedAt: 'x',
  bookings: 9,
  sufficient: true,
  averageRating: 4.5,
  pleasedPercent: 90,
  averageResponseHours: 5,
  topDestinations: [
    { destinationId: 'rome', name: 'Rome', count: 3, rating: 4.5, averagePrice: 900 },
    { destinationId: 'paris', name: 'Paris', count: 2, rating: null, averagePrice: null },
    { destinationId: 'lima', name: 'Lima', count: 1, rating: 5, averagePrice: 2000 }
  ],
  reviews: [],
  agents: [],
  airlines: [],
  ...overrides
});

const all = [...DESTINATIONS];

describe('trendingDestinations', () => {
  it('shows every destination we offer while there is no summary, too little data or fewer than three destinations', () => {
    expect(trendingDestinations(undefined, all)).toEqual(all);
    expect(trendingDestinations(null, all)).toEqual(all);
    expect(trendingDestinations(summary({ sufficient: false }), all)).toEqual(all);
    expect(trendingDestinations(summary({ topDestinations: summary().topDestinations.slice(0, 2) }), all)).toEqual(all);
  });

  it('leaves out a destination that is no longer offered', () => {
    const retired = all.map(place => ({ ...place, active: place.id !== 'bali' }));

    expect(trendingDestinations(undefined, retired).map(place => place.id)).not.toContain('bali');
  });

  it('shows the places travelers chose, most popular first, with how many chose them', () => {
    const places = trendingDestinations(summary(), all);

    expect(places.map(place => place.name)).toEqual(['Rome', 'Paris', 'Lima']);
    expect(places[0].note).toBe('Chosen by 3 travelers, average trip about $900');
    expect(places[1].note).toBe('Chosen by 2 travelers');
    expect(places[2].note).toBe('Chosen by 1 traveler, average trip about $2000');
  });

  it('dresses a known destination with its art and facts, and an unknown one with a pin and a colour', () => {
    const [rome, paris, lima] = trendingDestinations(summary(), all);

    expect(paris.id).toBe('paris');
    expect(paris.emoji).toBe(DESTINATIONS[0].emoji);
    expect(paris.imageSrc).toBe(DESTINATIONS[0].imageSrc);
    expect(paris.facts?.language).toBe('French');
    expect(rome.emoji).toBe('📍');
    expect(rome.facts).toBeUndefined();
    expect(rome.imageSrc).toBeUndefined();
    expect(rome.gradient).not.toBe(lima.gradient);
  });

  it('gives every sample destination facts to show', () => {
    DESTINATIONS.forEach(destination => expect(destination.facts?.bestSeason).toBeTruthy());
  });
});
