import { TRIP_CONFIG_DEFAULTS } from '../config/trip.config';
import { OrderPreferences } from '../interfaces/preferences.interface';
import { describePreferences } from './describe-preferences';

const config = TRIP_CONFIG_DEFAULTS;

const wishes: OrderPreferences = {
  flight: { stops: 'direct', checkedBaggage: true, cabin: 'business', departureTime: 'morning', preferredAirlines: ['ly', 'af'], flexibleDays: 2, maxLayoverHours: 3 },
  hotel: { breakfast: true, bedType: 'king', freeCancellation: true, rooms: 2, area: 'beach' },
  needs: { meal: 'kosher', seat: 'aisle', wheelchairAssistance: true },
  notes: 'Anniversary trip'
};

describe('describePreferences', () => {
  it('describes every wish in plain lines', () => {
    expect(describePreferences(wishes, config)).toEqual({
      flight: ['Direct only', 'Layover up to 3 h', 'Checked baggage', 'Business', 'Morning departure', 'Prefers El Al, Air France', 'Flexible by 2 days'],
      hotel: ['King bed', 'Near the beach', '2 rooms', 'Breakfast included', 'Free cancellation'],
      needs: ['Kosher', 'Aisle seat', 'Wheelchair assistance'],
      notes: 'Anniversary trip'
    });
  });

  it('leaves out everything that is on "no preference"', () => {
    const relaxed: OrderPreferences = {
      flight: { stops: 'max2', checkedBaggage: false, cabin: 'economy', departureTime: 'any', preferredAirlines: [], flexibleDays: 0 },
      hotel: { breakfast: false, bedType: 'any', freeCancellation: false, rooms: 1, area: 'any' },
      needs: { meal: 'none', seat: 'any', wheelchairAssistance: false }
    };

    expect(describePreferences(relaxed, config)).toEqual({ flight: ['Up to 2 stops', 'Economy'], hotel: [], needs: [], notes: '' });
  });

  it('says one day, not one days, and falls back to the raw id for an airline that was removed', () => {
    const lines = describePreferences({ flight: { ...wishes.flight!, preferredAirlines: ['xx'], flexibleDays: 1 } }, config);

    expect(lines.flight).toContain('Flexible by 1 day');
    expect(lines.flight).toContain('Prefers xx');
  });

  it('is empty for an order without wishes', () => {
    expect(describePreferences(undefined, config)).toEqual({ flight: [], hotel: [], needs: [], notes: '' });
    expect(describePreferences({ hotel: wishes.hotel }, config).flight).toEqual([]);
  });
});
