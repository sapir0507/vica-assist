import { TRIP_CONFIG_DEFAULTS, TripConfig } from '../config/trip.config';
import { contrastWithWhite, validateConfig } from './validate-config';

const copy = (): TripConfig => structuredClone(TRIP_CONFIG_DEFAULTS);

describe('validateConfig', () => {
  it('accepts the configuration that ships with the app', () => {
    expect(validateConfig(TRIP_CONFIG_DEFAULTS)).toEqual([]);
  });

  it('flags repeated airline ids and codes and bad codes', () => {
    const config = copy();
    config.airlines[1].id = config.airlines[0].id;
    config.airlines[2].code = config.airlines[0].code;
    config.airlines[3].code = 'lh1x';

    const errors = validateConfig(config);

    expect(errors.some(e => e.includes('used twice'))).toBe(true);
    expect(errors.some(e => e.includes('2 or 3 capital letters'))).toBe(true);
  });

  it('flags a colour that is invalid or too light for white text', () => {
    const config = copy();
    config.airlines[0].brandColor = 'blue';
    config.airlines[1].brandColor = '#ffee00';

    const errors = validateConfig(config);

    expect(errors.some(e => e.includes('invalid colour'))).toBe(true);
    expect(errors.some(e => e.includes('too light'))).toBe(true);
  });

  it('needs at least one active airline and one active item per list', () => {
    const config = copy();
    config.airlines.forEach(a => (a.active = false));
    config.cabins.forEach(c => (c.active = false));

    const errors = validateConfig(config);

    expect(errors).toContain('At least one airline must be active.');
    expect(errors).toContain('The list "cabins" needs at least one active item.');
  });

  it('flags repeated or missing option ids and empty labels', () => {
    const config = copy();
    config.bedTypes[1].id = config.bedTypes[0].id;
    config.meals[0].label = '  ';

    const errors = validateConfig(config);

    expect(errors.some(e => e.includes('"bedTypes"'))).toBe(true);
    expect(errors.some(e => e.includes('"meals"'))).toBe(true);
  });

  it('keeps limits whole and inside their bounds', () => {
    const config = copy();
    config.limits.maxTravelers = 0;
    config.limits.maxRooms = 2.5;
    config.limits.notesMaxLength = 99999;

    const errors = validateConfig(config);

    expect(errors.filter(e => e.startsWith('Limit'))).toHaveLength(3);
  });

  it('keeps the assignment rules and the public minimum sensible', () => {
    const config = copy();
    config.assignment = { loadWeight: 0, specialtyWeight: 0, responseHours: 0 };
    config.publicMinimum = 0;

    const errors = validateConfig(config);

    expect(errors).toContain('Assignment weights must be 0 or more and not both 0.');
    expect(errors).toContain('The response promise must be 1 to 168 hours.');
    expect(errors).toContain('The public minimum must be 1 to 100.');
  });
});

describe('contrastWithWhite', () => {
  it('is the maximum for black and the minimum for white', () => {
    expect(contrastWithWhite('#000000')).toBeCloseTo(21, 0);
    expect(contrastWithWhite('#ffffff')).toBeCloseTo(1, 0);
  });
});
