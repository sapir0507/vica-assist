import { labelOf, TripConfig } from '../config/trip.config';
import { Order } from '../interfaces/order.interface';

export interface FlightOffer {
  /** Number of stops, as saved by the agent form ("0", "1", "2"). */
  stops?: string | number;
  stopDuration?: string;
  airlineId?: string;
  cabin?: string;
  bagage?: string | boolean;
  departureHour?: string;
  price?: number | string;
}

export interface HotelOffer {
  stars?: number | string;
  breakfast?: boolean | string;
  bedType?: string;
  cancelation?: string;
  price?: number | string;
}

const MAX_STOPS: Record<string, number> = { direct: 0, max1: 1, max2: 2 };
const TIME_WINDOWS: Record<string, [number, number]> = { morning: [5, 12], afternoon: [12, 17], evening: [17, 24] };

const isYes = (value: string | boolean | undefined): boolean => value === true || value === 'true';
const minutesOf = (time: string | undefined): number | null => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time ?? '');
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};
const overBudget = (order: Order, price: number | string | undefined): boolean =>
  price !== undefined && price !== '' && Number(order.priceRange) > 0 && Number(price) > Number(order.priceRange);

/** How a flight differs from what the customer asked for; an empty list means it matches. */
export function checkFlight(order: Order | undefined, offer: FlightOffer, config: TripConfig): string[] {
  if (!order) return [];
  const wishes = order.preferences?.flight;
  const problems: string[] = [];

  if (wishes) {
    const stops = Number(offer.stops);
    const allowed = MAX_STOPS[wishes.stops];
    if (Number.isFinite(stops) && allowed !== undefined && stops > allowed) {
      problems.push(`Has ${stops} ${stops === 1 ? 'stop' : 'stops'}; the customer asked for ${labelOf(config.stopsOptions, wishes.stops).toLowerCase()}.`);
    }
    const layover = minutesOf(offer.stopDuration);
    if (wishes.maxLayoverHours && layover !== null && layover > wishes.maxLayoverHours * 60) {
      problems.push(`The layover is longer than the ${wishes.maxLayoverHours} hours the customer accepts.`);
    }
    if (wishes.checkedBaggage && offer.bagage !== undefined && !isYes(offer.bagage)) {
      problems.push('Checked baggage is not included; the customer wants it.');
    }
    if (offer.cabin && wishes.cabin && offer.cabin !== wishes.cabin) {
      problems.push(`The cabin is ${labelOf(config.cabins, offer.cabin)}; the customer asked for ${labelOf(config.cabins, wishes.cabin)}.`);
    }
    if (offer.airlineId && wishes.preferredAirlines.length > 0 && !wishes.preferredAirlines.includes(offer.airlineId)) {
      problems.push('This is not one of the customer\'s preferred airlines.');
    }
    const window = TIME_WINDOWS[wishes.departureTime];
    const departure = minutesOf(offer.departureHour);
    if (window && departure !== null && (departure < window[0] * 60 || departure >= window[1] * 60)) {
      problems.push(`Departs at ${offer.departureHour}; the customer prefers ${labelOf(config.departureTimes, wishes.departureTime).toLowerCase()}.`);
    }
  }
  if (overBudget(order, offer.price)) problems.push('The price is above the customer\'s budget.');
  return problems;
}

/** How a hotel differs from what the customer asked for; an empty list means it matches. */
export function checkHotel(order: Order | undefined, offer: HotelOffer, config: TripConfig): string[] {
  if (!order) return [];
  const wishes = order.preferences?.hotel;
  const problems: string[] = [];

  const minimumStars = Number(order.stars);
  if (minimumStars > 0 && offer.stars !== undefined && offer.stars !== '' && Number(offer.stars) < minimumStars) {
    problems.push(`${offer.stars} stars; the customer asked for at least ${minimumStars}.`);
  }
  if (wishes) {
    if (wishes.breakfast && offer.breakfast !== undefined && !isYes(offer.breakfast)) {
      problems.push('Breakfast is not included; the customer wants it.');
    }
    if (wishes.freeCancellation && offer.cancelation && offer.cancelation !== 'included') {
      problems.push('Free cancellation is not included; the customer wants it.');
    }
    if (wishes.bedType !== 'any' && offer.bedType && offer.bedType !== wishes.bedType) {
      problems.push(`The bed is ${labelOf(config.bedTypes, offer.bedType).toLowerCase()}; the customer asked for ${labelOf(config.bedTypes, wishes.bedType).toLowerCase()}.`);
    }
  }
  if (overBudget(order, offer.price)) problems.push('The price is above the customer\'s budget.');
  return problems;
}
