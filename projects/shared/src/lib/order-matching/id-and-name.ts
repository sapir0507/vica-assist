const ID_LENGTH = 9;
const MIN_ID_DIGITS = 5;
const WORD = /^[\p{L}\p{M}][\p{L}\p{M}'.-]*$/u;

/** Israeli ID: 5 to 9 digits (older IDs are shorter), left-padded to 9, with the standard check digit. */
export function isValidIsraeliId(value: unknown): boolean {
  const digits = String(value ?? '').trim();
  if (!/^\d+$/.test(digits) || digits.length < MIN_ID_DIGITS || digits.length > ID_LENGTH) return false;

  const padded = digits.padStart(ID_LENGTH, '0');
  if (/^0+$/.test(padded)) return false;

  const total = [...padded].reduce((sum, char, index) => {
    const product = Number(char) * (index % 2 === 0 ? 1 : 2);
    return sum + (product > 9 ? product - 9 : product);
  }, 0);
  return total % 10 === 0;
}

export const collapseSpaces = (value: string): string => value.trim().replace(/\s+/g, ' ');

/** At least a first and a last name, letters only (with hyphen, apostrophe and dot), no digits. */
export function isValidFullName(value: unknown, maxLength: number): boolean {
  const name = collapseSpaces(String(value ?? ''));
  if (name.length === 0 || name.length > maxLength) return false;

  const words = name.split(' ');
  return words.length >= 2 && words.every(word => WORD.test(word) && word.replace(/[^\p{L}]/gu, '').length >= 2);
}
