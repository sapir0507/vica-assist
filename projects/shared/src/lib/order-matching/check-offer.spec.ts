import { TRIP_CONFIG_DEFAULTS } from '../config/trip.config';
import { Order } from '../interfaces/order.interface';
import { checkFlight, checkHotel } from './check-offer';

const config = TRIP_CONFIG_DEFAULTS;

const order = (overrides: Partial<Order> = {}): Order => ({
  id: 1,
  orderID: '1',
  choice: 'both',
  status: 'pending',
  departureDate: '2026-12-01',
  returnDate: '2026-12-08',
  origin: 'Tel Aviv',
  destination: 'Paris',
  passDetails: [],
  priceRange: 1000,
  stars: 4,
  preferences: {
    flight: { stops: 'direct', checkedBaggage: true, cabin: 'economy', departureTime: 'morning', preferredAirlines: ['ly', 'af'], flexibleDays: 0 },
    hotel: { breakfast: true, bedType: 'king', freeCancellation: false, rooms: 1, area: 'any' }
  },
  ...overrides
});

const goodFlight = { stops: '0', airlineId: 'ly', cabin: 'economy', bagage: 'true', departureHour: '08:30', price: 400 };

describe('checkFlight', () => {
  it('has nothing to say about a flight that matches', () => {
    expect(checkFlight(order(), goodFlight, config)).toEqual([]);
  });

  it('says nothing without an order, and only compares the budget when there are no flight wishes', () => {
    expect(checkFlight(undefined, goodFlight, config)).toEqual([]);
    expect(checkFlight(order({ preferences: undefined }), { stops: '3', price: 2000 }, config)).toEqual(['The price is above the customer\'s budget.']);
  });

  it('flags more stops than asked for', () => {
    const problems = checkFlight(order(), { ...goodFlight, stops: '1' }, config);

    expect(problems).toEqual(['Has 1 stop; the customer asked for direct only.']);
  });

  it('accepts up to the allowed number of stops', () => {
    const wishes = order().preferences!.flight!;
    const withStops = order({ preferences: { flight: { ...wishes, stops: 'max1' } } });

    expect(checkFlight(withStops, { ...goodFlight, stops: '1' }, config)).toEqual([]);
    expect(checkFlight(withStops, { ...goodFlight, stops: '2' }, config)[0]).toContain('Has 2 stops');
  });

  it('flags a layover that is too long', () => {
    const wishes = order().preferences!.flight!;
    const long = order({ preferences: { flight: { ...wishes, stops: 'max1', maxLayoverHours: 3 } } });

    expect(checkFlight(long, { ...goodFlight, stops: '1', stopDuration: '03:30' }, config)).toEqual(['The layover is longer than the 3 hours the customer accepts.']);
    expect(checkFlight(long, { ...goodFlight, stops: '1', stopDuration: '02:15' }, config)).toEqual([]);
  });

  it('flags missing checked baggage', () => {
    expect(checkFlight(order(), { ...goodFlight, bagage: 'false' }, config)).toEqual(['Checked baggage is not included; the customer wants it.']);
  });

  it('flags another cabin using the labels from the configuration', () => {
    expect(checkFlight(order(), { ...goodFlight, cabin: 'business' }, config)).toEqual(['The cabin is Business; the customer asked for Economy.']);
  });

  it('flags an airline that is not preferred, unless the customer has no preference', () => {
    expect(checkFlight(order(), { ...goodFlight, airlineId: 'tk' }, config)).toEqual(['This is not one of the customer\'s preferred airlines.']);

    const wishes = order().preferences!.flight!;
    const open = order({ preferences: { flight: { ...wishes, preferredAirlines: [] } } });
    expect(checkFlight(open, { ...goodFlight, airlineId: 'tk' }, config)).toEqual([]);
  });

  it('flags a departure outside the preferred time of day', () => {
    expect(checkFlight(order(), { ...goodFlight, departureHour: '19:10' }, config)).toEqual(['Departs at 19:10; the customer prefers morning.']);
    expect(checkFlight(order(), { ...goodFlight, departureHour: '12:00' }, config)).toHaveLength(1);
  });

  it('flags a price above the budget and reports every problem at once', () => {
    const problems = checkFlight(order(), { stops: '2', bagage: 'false', price: 1500 }, config);

    expect(problems).toHaveLength(3);
    expect(problems[problems.length - 1]).toBe('The price is above the customer\'s budget.');
  });

  it('ignores fields the agent has not filled in', () => {
    expect(checkFlight(order(), {}, config)).toEqual([]);
  });
});

describe('checkHotel', () => {
  const goodHotel = { stars: 4, breakfast: true, bedType: 'king', price: 500 };

  it('has nothing to say about a hotel that matches', () => {
    expect(checkHotel(order(), goodHotel, config)).toEqual([]);
  });

  it('flags fewer stars than the minimum', () => {
    expect(checkHotel(order(), { ...goodHotel, stars: 3 }, config)).toEqual(['3 stars; the customer asked for at least 4.']);
  });

  it('flags missing breakfast', () => {
    expect(checkHotel(order(), { ...goodHotel, breakfast: false }, config)).toEqual(['Breakfast is not included; the customer wants it.']);
    expect(checkHotel(order(), { ...goodHotel, breakfast: 'false' }, config)).toHaveLength(1);
  });

  it('flags another bed type, but not when the customer has no preference', () => {
    expect(checkHotel(order(), { ...goodHotel, bedType: 'twin' }, config)).toEqual(['The bed is twin beds; the customer asked for king bed.']);

    const wishes = order().preferences!.hotel!;
    const open = order({ preferences: { hotel: { ...wishes, bedType: 'any' } } });
    expect(checkHotel(open, { ...goodHotel, bedType: 'twin' }, config)).toEqual([]);
  });

  it('flags free cancellation that is not included, when the customer wants it', () => {
    const wishes = order().preferences!.hotel!;
    const wanted = order({ preferences: { hotel: { ...wishes, freeCancellation: true } } });

    expect(checkHotel(wanted, { ...goodHotel, cancelation: 'not included' }, config)).toEqual(['Free cancellation is not included; the customer wants it.']);
    expect(checkHotel(wanted, { ...goodHotel, cancelation: 'included' }, config)).toEqual([]);
    expect(checkHotel(order(), { ...goodHotel, cancelation: 'not included' }, config)).toEqual([]);
  });

  it('flags a price above the budget', () => {
    expect(checkHotel(order(), { ...goodHotel, price: 1200 }, config)).toEqual(['The price is above the customer\'s budget.']);
  });

  it('copes with an order that has no stars or preferences', () => {
    expect(checkHotel(order({ stars: undefined, preferences: undefined }), { stars: 1 }, config)).toEqual([]);
    expect(checkHotel(undefined, goodHotel, config)).toEqual([]);
  });
});
