import { labelOf, TripConfig } from '../config/trip.config';
import { OrderPreferences } from '../interfaces/preferences.interface';

export interface PreferenceLines {
  flight: string[];
  hotel: string[];
  needs: string[];
  notes: string;
}

/** The customer's wishes as short lines, leaving out everything they left on "no preference". */
export function describePreferences(preferences: OrderPreferences | undefined, config: TripConfig): PreferenceLines {
  const lines: PreferenceLines = { flight: [], hotel: [], needs: [], notes: preferences?.notes ?? '' };
  if (!preferences) return lines;

  const { flight, hotel, needs } = preferences;
  if (flight) {
    lines.flight.push(labelOf(config.stopsOptions, flight.stops));
    if (flight.maxLayoverHours) lines.flight.push(`Layover up to ${flight.maxLayoverHours} h`);
    if (flight.checkedBaggage) lines.flight.push('Checked baggage');
    lines.flight.push(labelOf(config.cabins, flight.cabin));
    if (flight.departureTime !== 'any') lines.flight.push(`${labelOf(config.departureTimes, flight.departureTime)} departure`);
    if (flight.preferredAirlines.length > 0) {
      const names = flight.preferredAirlines.map(id => config.airlines.find(airline => airline.id === id)?.name ?? id);
      lines.flight.push(`Prefers ${names.join(', ')}`);
    }
    if (flight.flexibleDays > 0) lines.flight.push(`Flexible by ${flight.flexibleDays} ${flight.flexibleDays === 1 ? 'day' : 'days'}`);
  }
  if (hotel) {
    if (hotel.bedType !== 'any') lines.hotel.push(labelOf(config.bedTypes, hotel.bedType));
    if (hotel.area !== 'any') lines.hotel.push(labelOf(config.hotelAreas, hotel.area));
    if (hotel.rooms > 1) lines.hotel.push(`${hotel.rooms} rooms`);
    if (hotel.breakfast) lines.hotel.push('Breakfast included');
    if (hotel.freeCancellation) lines.hotel.push('Free cancellation');
  }
  if (needs) {
    if (needs.meal !== 'none') lines.needs.push(labelOf(config.meals, needs.meal));
    if (needs.seat !== 'any') lines.needs.push(`${labelOf(config.seatTypes, needs.seat)} seat`);
    if (needs.wheelchairAssistance) lines.needs.push('Wheelchair assistance');
  }
  return lines;
}
