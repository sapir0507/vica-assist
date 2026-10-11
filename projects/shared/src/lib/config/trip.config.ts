import tripConfigJson from './trip-config.json';

export interface ConfigOption {
  id: string;
  label: string;
  active: boolean;
}

export interface Airline {
  id: string;
  code: string;
  name: string;
  country: string;
  hub: string;
  brandColor: string;
  baggage: { checkedIncludedEconomy: boolean; weightKg: number };
  active: boolean;
}

export interface TripLimits {
  maxTravelers: number;
  maxRooms: number;
  maxStops: number;
  maxLayoverHours: number;
  maxFlexibleDays: number;
  nameMaxLength: number;
  notesMaxLength: number;
  messageMaxLength: number;
}

export interface AssignmentRules {
  loadWeight: number;
  specialtyWeight: number;
  responseHours: number;
}

export const OPTION_LISTS = ['cabins', 'stopsOptions', 'departureTimes', 'bedTypes', 'hotelAreas', 'meals', 'seatTypes'] as const;
export type OptionListName = (typeof OPTION_LISTS)[number];

export type TripConfig = {
  version: number;
  airlines: Airline[];
  limits: TripLimits;
  assignment: AssignmentRules;
  publicMinimum: number;
} & Record<OptionListName, ConfigOption[]>;

/** The defaults shipped with the app; the admin's saved settings are merged over them at runtime. */
export const TRIP_CONFIG_DEFAULTS: TripConfig = tripConfigJson;

export const activeOptions = (options: ConfigOption[]): ConfigOption[] => options.filter(option => option.active);

/** Old records keep resolving after an option is deactivated; an unknown id is shown as it is. */
export const labelOf = (options: ConfigOption[], id: string | undefined): string =>
  options.find(option => option.id === id)?.label ?? id ?? '';
