import { OPTION_LISTS, TripConfig } from '../config/trip.config';

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const AIRLINE_CODE = /^[A-Z0-9]{2,3}$/;
const MIN_CONTRAST = 4.5;

const LIMIT_BOUNDS: Record<keyof TripConfig['limits'], [number, number]> = {
  maxTravelers: [1, 20],
  maxRooms: [1, 10],
  maxStops: [0, 3],
  maxLayoverHours: [1, 48],
  maxFlexibleDays: [0, 7],
  nameMaxLength: [20, 120],
  notesMaxLength: [100, 2000],
  messageMaxLength: [100, 5000]
};

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map(start => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast of white text on the colour, so airline chips stay readable. */
export const contrastWithWhite = (hex: string): number => 1.05 / (luminance(hex) + 0.05);

/** Returns every problem found; an empty list means the configuration is safe to use. */
export function validateConfig(config: TripConfig): string[] {
  const errors: string[] = [];
  const isInteger = (value: unknown): value is number => Number.isInteger(value);

  const seenIds = new Set<string>();
  const seenCodes = new Set<string>();
  for (const airline of config.airlines) {
    if (!airline.id || seenIds.has(airline.id)) errors.push(`Airline id "${airline.id}" is missing or used twice.`);
    seenIds.add(airline.id);
    if (!AIRLINE_CODE.test(airline.code)) errors.push(`Airline "${airline.name}" needs a code of 2 or 3 capital letters or digits.`);
    if (seenCodes.has(airline.code)) errors.push(`Airline code "${airline.code}" is used twice.`);
    seenCodes.add(airline.code);
    if (airline.name.trim().length < 2) errors.push(`Airline "${airline.id}" needs a name.`);
    if (!HEX_COLOR.test(airline.brandColor)) errors.push(`Airline "${airline.name}" has an invalid colour.`);
    else if (contrastWithWhite(airline.brandColor) < MIN_CONTRAST) errors.push(`Airline "${airline.name}" has a colour too light for white text.`);
    if (!isInteger(airline.baggage.weightKg) || airline.baggage.weightKg < 0 || airline.baggage.weightKg > 50) {
      errors.push(`Airline "${airline.name}" has an invalid baggage weight.`);
    }
  }
  if (!config.airlines.some(airline => airline.active)) errors.push('At least one airline must be active.');

  for (const list of OPTION_LISTS) {
    const options = config[list];
    const ids = options.map(option => option.id);
    if (new Set(ids).size !== ids.length || ids.some(id => !id)) errors.push(`The list "${list}" has a missing or repeated id.`);
    if (options.some(option => option.label.trim() === '')) errors.push(`The list "${list}" has an item without a label.`);
    if (!options.some(option => option.active)) errors.push(`The list "${list}" needs at least one active item.`);
  }

  for (const [key, [min, max]] of Object.entries(LIMIT_BOUNDS)) {
    const value = config.limits[key as keyof TripConfig['limits']];
    if (!isInteger(value) || value < min || value > max) errors.push(`Limit "${key}" must be a whole number from ${min} to ${max}.`);
  }

  const { loadWeight, specialtyWeight, responseHours } = config.assignment;
  if (!(loadWeight >= 0) || !(specialtyWeight >= 0) || loadWeight + specialtyWeight === 0) errors.push('Assignment weights must be 0 or more and not both 0.');
  if (!isInteger(responseHours) || responseHours < 1 || responseHours > 168) errors.push('The response promise must be 1 to 168 hours.');
  if (!isInteger(config.publicMinimum) || config.publicMinimum < 1 || config.publicMinimum > 100) errors.push('The public minimum must be 1 to 100.');

  return errors;
}
