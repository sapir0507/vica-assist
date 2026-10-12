import { PublicSummary } from '@vica-assist/shared';

import { DESTINATIONS, trendingDestinations } from './destinations';

const summary = (overrides: Partial<PublicSummary> = {}): PublicSummary => ({
  updatedAt: 'x',
  bookings: 9,
  sufficient: true,
  averageRating: 4.5,
  pleasedPercent: 90,
  averageResponseHours: 5,
  topDestinations: [
    { name: 'Rome', count: 3, rating: 4.5, averagePrice: 900 },
    { name: 'paris', count: 2, rating: null, averagePrice: null },
    { name: 'Lima', count: 1, rating: 5, averagePrice: 2000 }
  ],
  reviews: [],
  agents: [],
  airlines: [],
  ...overrides
});

describe('trendingDestinations', () => {
  it('shows the sample six while there is no summary, too little data or fewer than three destinations', () => {
    expect(trendingDestinations(undefined)).toEqual([...DESTINATIONS]);
    expect(trendingDestinations(null)).toEqual([...DESTINATIONS]);
    expect(trendingDestinations(summary({ sufficient: false }))).toEqual([...DESTINATIONS]);
    expect(trendingDestinations(summary({ topDestinations: summary().topDestinations.slice(0, 2) }))).toEqual([...DESTINATIONS]);
  });

  it('shows the places travelers chose, most popular first, with how many chose them', () => {
    const places = trendingDestinations(summary());

    expect(places.map(place => place.name)).toEqual(['Rome', 'paris', 'Lima']);
    expect(places[0].note).toBe('Chosen by 3 travelers, average trip about $900');
    expect(places[1].note).toBe('Chosen by 2 travelers');
    expect(places[2].note).toBe('Chosen by 1 traveler, average trip about $2000');
  });

  it('dresses a known place with its art and facts, and an unknown one with a pin and a colour', () => {
    const [rome, paris, lima] = trendingDestinations(summary());

    expect(paris.emoji).toBe(DESTINATIONS[0].emoji);
    expect(paris.facts?.language).toBe('French');
    expect(rome.emoji).toBe('📍');
    expect(rome.facts).toBeUndefined();
    expect(rome.gradient).not.toBe(lima.gradient);
  });

  it('gives every sample destination facts to show', () => {
    DESTINATIONS.forEach(destination => expect(destination.facts?.bestSeason).toBeTruthy());
  });
});
