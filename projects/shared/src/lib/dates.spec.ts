import { FormControl, FormGroup } from '@angular/forms';

import { dateRangeValidator, toDateInputValue } from './dates';

describe('toDateInputValue', () => {
  it('returns an empty string for missing or invalid values', () => {
    expect(toDateInputValue(undefined)).toBe('');
    expect(toDateInputValue(null)).toBe('');
    expect(toDateInputValue('')).toBe('');
    expect(toDateInputValue('not a date')).toBe('');
  });

  it('keeps a plain date as it is', () => {
    expect(toDateInputValue('2026-06-09')).toBe('2026-06-09');
  });

  it('reads an old timestamp as the local day it was picked on', () => {
    const localMidnight = new Date(2026, 5, 9).toISOString();

    expect(toDateInputValue(localMidnight)).toBe('2026-06-09');
  });
});

describe('dateRangeValidator', () => {
  const group = (start: string, end: string) =>
    new FormGroup(
      { start: new FormControl(start), end: new FormControl(end) },
      { validators: dateRangeValidator('start', 'end') }
    );

  it('flags a return before the departure', () => {
    expect(group('2026-06-10', '2026-06-09').errors).toEqual({ dateRange: true });
  });

  it('accepts the same day and later days', () => {
    expect(group('2026-06-10', '2026-06-10').errors).toBeNull();
    expect(group('2026-06-10', '2026-06-20').errors).toBeNull();
  });

  it('does not complain while one of the dates is still empty', () => {
    expect(group('2026-06-10', '').errors).toBeNull();
    expect(group('', '2026-06-09').errors).toBeNull();
  });
});
