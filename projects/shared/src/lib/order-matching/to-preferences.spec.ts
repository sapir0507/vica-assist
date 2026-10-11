import { PreferencesFormValue, toPreferences } from './to-preferences';

const value = (overrides: Partial<PreferencesFormValue> = {}): PreferencesFormValue => ({
  flight: { stops: 'max1', maxLayoverHours: '4', checkedBaggage: true, cabin: 'premium', departureTime: 'evening', preferredAirlines: ['ly'], flexibleDays: '2' },
  hotel: { breakfast: true, bedType: 'queen', freeCancellation: true, rooms: '2', area: 'beach' },
  needs: { meal: 'vegan', seat: 'aisle', wheelchairAssistance: false },
  notes: '  Quiet seats please  ',
  ...overrides
});

describe('toPreferences', () => {
  it('carries flight, hotel and needs for a flight and hotel trip, with numbers as numbers', () => {
    const result = toPreferences('both', value());

    expect(result.flight).toEqual({
      stops: 'max1',
      maxLayoverHours: 4,
      checkedBaggage: true,
      cabin: 'premium',
      departureTime: 'evening',
      preferredAirlines: ['ly'],
      flexibleDays: 2
    });
    expect(result.hotel).toEqual({ breakfast: true, bedType: 'queen', freeCancellation: true, rooms: 2, area: 'beach' });
    expect(result.needs).toEqual({ meal: 'vegan', seat: 'aisle', wheelchairAssistance: false });
    expect(result.notes).toBe('Quiet seats please');
  });

  it('leaves the hotel wishes out of a flight-only trip and the flight wishes out of a hotel-only trip', () => {
    expect(toPreferences('flight', value()).hotel).toBeUndefined();
    expect(toPreferences('hotel', value()).flight).toBeUndefined();
    expect(toPreferences('hotel', value()).hotel).toBeDefined();
  });

  it('drops the layover limit for a direct flight and when it is empty', () => {
    const direct = value({ flight: { ...value().flight, stops: 'direct' } });
    const empty = value({ flight: { ...value().flight, maxLayoverHours: '' } });

    expect(toPreferences('flight', direct).flight).not.toHaveProperty('maxLayoverHours');
    expect(toPreferences('flight', empty).flight).not.toHaveProperty('maxLayoverHours');
    expect(toPreferences('flight', value({ flight: { ...value().flight, maxLayoverHours: null } })).flight).not.toHaveProperty('maxLayoverHours');
  });

  it('leaves out blank notes', () => {
    expect(toPreferences('both', value({ notes: '   ' }))).not.toHaveProperty('notes');
  });

  it('copies the airline list so the form keeps its own', () => {
    const form = value();
    const result = toPreferences('flight', form);

    result.flight!.preferredAirlines.push('af');

    expect(form.flight.preferredAirlines).toEqual(['ly']);
  });
});
