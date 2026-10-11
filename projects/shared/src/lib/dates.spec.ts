import { FormControl, FormGroup } from '@angular/forms';

import { dateRangeValidator, notInPastValidator, toDateInputValue } from './dates';

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

describe('notInPastValidator', () => {
  const today = () => new Date(2026, 5, 10, 15, 30);
  const validate = (value: string) => notInPastValidator(today)(new FormControl(value));

  it('rejects a day before today', () => {
    expect(validate('2026-06-09')).toEqual({ pastDate: true });
  });

  it('accepts today and later days', () => {
    expect(validate('2026-06-10')).toBeNull();
    expect(validate('2026-12-31')).toBeNull();
  });

  it('leaves an empty or unreadable value to the required validator', () => {
    expect(validate('')).toBeNull();
    expect(validate('soon')).toBeNull();
  });
});
