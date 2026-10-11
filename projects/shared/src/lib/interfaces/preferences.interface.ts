export interface FlightPreferences {
  /** An id from the `stopsOptions` list: `direct`, `max1` or `max2`. */
  stops: string;
  maxLayoverHours?: number;
  checkedBaggage: boolean;
  cabin: string;
  departureTime: string;
  /** Ids of the airlines the customer prefers; empty means no preference. */
  preferredAirlines: string[];
  flexibleDays: number;
}

export interface HotelPreferences {
  breakfast: boolean;
  bedType: string;
  freeCancellation: boolean;
  rooms: number;
  area: string;
}

export interface TravelNeeds {
  meal: string;
  seat: string;
  wheelchairAssistance: boolean;
}

export interface OrderPreferences {
  flight?: FlightPreferences;
  hotel?: HotelPreferences;
  needs?: TravelNeeds;
  notes?: string;
}
