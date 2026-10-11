import { collapseSpaces, isValidFullName, isValidIsraeliId } from './id-and-name';

describe('isValidIsraeliId', () => {
  it('accepts IDs with a correct check digit', () => {
    expect(isValidIsraeliId('123456782')).toBe(true);
    expect(isValidIsraeliId(' 123456782 ')).toBe(true);
  });

  it('accepts older, shorter IDs by padding them to 9 digits', () => {
    expect(isValidIsraeliId('00018')).toBe(true);
    expect(isValidIsraeliId('18')).toBe(false);
    expect(isValidIsraeliId(18)).toBe(false);
  });

  it('rejects an ID that is one digit off', () => {
    expect(isValidIsraeliId('123456789')).toBe(false);
    expect(isValidIsraeliId('123456783')).toBe(false);
  });

  it('rejects the wrong length, letters and all zeros', () => {
    expect(isValidIsraeliId('1234')).toBe(false);
    expect(isValidIsraeliId('1234567820')).toBe(false);
    expect(isValidIsraeliId('12345678a')).toBe(false);
    expect(isValidIsraeliId('000000000')).toBe(false);
    expect(isValidIsraeliId('')).toBe(false);
    expect(isValidIsraeliId(null)).toBe(false);
  });
});

describe('isValidFullName', () => {
  it('accepts a first and a last name', () => {
    expect(isValidFullName('Dana Levi', 60)).toBe(true);
    expect(isValidFullName('  Dana   Levi  ', 60)).toBe(true);
  });

  it('accepts hyphens, apostrophes, dots and non-latin letters', () => {
    expect(isValidFullName("Mary-Jane O'Neil", 60)).toBe(true);
    expect(isValidFullName('José Ñúñez', 60)).toBe(true);
    expect(isValidFullName('דנה לוי', 60)).toBe(true);
    expect(isValidFullName('Jr. Smith', 60)).toBe(true);
  });

  it('rejects one word, digits and symbols', () => {
    expect(isValidFullName('Dana', 60)).toBe(false);
    expect(isValidFullName('Dana Levi 2', 60)).toBe(false);
    expect(isValidFullName('Dana L3vi', 60)).toBe(false);
    expect(isValidFullName('Dana @Levi', 60)).toBe(false);
    expect(isValidFullName('- -', 60)).toBe(false);
  });

  it('rejects initials only, empty values and names that are too long', () => {
    expect(isValidFullName('D L', 60)).toBe(false);
    expect(isValidFullName('', 60)).toBe(false);
    expect(isValidFullName(undefined, 60)).toBe(false);
    expect(isValidFullName('Dana Levi', 5)).toBe(false);
  });
});

describe('collapseSpaces', () => {
  it('trims and keeps single spaces', () => {
    expect(collapseSpaces('  a   b ')).toBe('a b');
  });
});
