import { canonicalPlace, isKnownPlace, KNOWN_PLACES, normalisePlace, suggestPlaces } from './places';

describe('normalisePlace', () => {
  it('ignores case, accents and extra spaces', () => {
    expect(normalisePlace('  Zürich ')).toBe('zurich');
    expect(normalisePlace('SÃO   PAULO')).toBe('sao paulo');
    expect(normalisePlace(null)).toBe('');
  });
});

describe('isKnownPlace', () => {
  it('accepts countries and cities however they are typed', () => {
    expect(isKnownPlace('Israel')).toBe(true);
    expect(isKnownPlace(' tel  aviv ')).toBe(true);
    expect(isKnownPlace('zurich')).toBe(true);
    expect(isKnownPlace('Reykjavik')).toBe(true);
    expect(isKnownPlace('sao paulo')).toBe(true);
  });

  it('rejects streets, made-up places and empty values', () => {
    expect(isKnownPlace('Flat 5 Main Street')).toBe(false);
    expect(isKnownPlace('Atlantis')).toBe(false);
    expect(isKnownPlace('')).toBe(false);
    expect(isKnownPlace(undefined)).toBe(false);
  });

  it('lists every place once, in order', () => {
    expect(new Set(KNOWN_PLACES).size).toBe(KNOWN_PLACES.length);
    expect(KNOWN_PLACES.length).toBeGreaterThan(250);
    expect(KNOWN_PLACES).toEqual([...KNOWN_PLACES].sort((a, b) => a.localeCompare(b)));
  });
});

describe('suggestPlaces', () => {
  it('matches anywhere in the name and caps the list', () => {
    expect(suggestPlaces('lis')).toContain('Lisbon');
    expect(suggestPlaces('')).toHaveLength(8);
    expect(suggestPlaces('a', 3)).toHaveLength(3);
  });

  it('finds accented names without typing the accent', () => {
    expect(suggestPlaces('sao')).toEqual(['São Paulo']);
  });

  it('suggests nothing for gibberish', () => {
    expect(suggestPlaces('qqqq')).toEqual([]);
  });
});

describe('canonicalPlace', () => {
  it('gives the place as we spell it', () => {
    expect(canonicalPlace('paris')).toBe('Paris');
    expect(canonicalPlace(' ZURICH ')).toBe('Zürich');
  });

  it('gives nothing for text that is not a known place, however it looks', () => {
    expect(canonicalPlace('Atlantis')).toBeNull();
    expect(canonicalPlace('https://evil.example')).toBeNull();
    expect(canonicalPlace('<script>alert(1)</script>')).toBeNull();
    expect(canonicalPlace(null)).toBeNull();
  });
});
