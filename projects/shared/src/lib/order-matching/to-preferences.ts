import { OrderPreferences } from '../interfaces/preferences.interface';

export interface PreferencesFormValue {
  flight: {
    stops: string;
    maxLayoverHours: number | string | null;
    checkedBaggage: boolean;
    cabin: string;
    departureTime: string;
    preferredAirlines: string[];
    flexibleDays: number | string;
  };
  hotel: { breakfast: boolean; bedType: string; freeCancellation: boolean; rooms: number | string; area: string };
  needs: { meal: string; seat: string; wheelchairAssistance: boolean };
  notes: string;
}

/** Builds what is sent with the order; a hotel-only trip carries no flight wishes and the other way round. */
export function toPreferences(choice: string, value: PreferencesFormValue): OrderPreferences {
  const preferences: OrderPreferences = { needs: { ...value.needs } };

  if (choice === 'both' || choice === 'flight') {
    const layover = value.flight.maxLayoverHours;
    preferences.flight = {
      stops: value.flight.stops,
      checkedBaggage: value.flight.checkedBaggage,
      cabin: value.flight.cabin,
      departureTime: value.flight.departureTime,
      preferredAirlines: [...value.flight.preferredAirlines],
      flexibleDays: Number(value.flight.flexibleDays),
      ...(value.flight.stops !== 'direct' && layover !== null && layover !== '' ? { maxLayoverHours: Number(layover) } : {})
    };
  }
  if (choice === 'both' || choice === 'hotel') {
    preferences.hotel = { ...value.hotel, rooms: Number(value.hotel.rooms) };
  }

  const notes = value.notes.trim();
  if (notes) preferences.notes = notes;
  return preferences;
}
