import { activeOptions, labelOf, TRIP_CONFIG_DEFAULTS } from './trip.config';

describe('trip config helpers', () => {
  const cabins = TRIP_CONFIG_DEFAULTS.cabins.map(c => ({ ...c }));

  it('lists only active options', () => {
    cabins[2].active = false;

    expect(activeOptions(cabins).map(c => c.id)).toEqual(['economy', 'premium']);
  });

  it('still names an option that was deactivated, and falls back to the id for an unknown one', () => {
    expect(labelOf(cabins, 'business')).toBe('Business');
    expect(labelOf(cabins, 'first')).toBe('first');
    expect(labelOf(cabins, undefined)).toBe('');
  });
});
