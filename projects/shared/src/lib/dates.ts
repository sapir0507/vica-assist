import { ValidatorFn } from '@angular/forms';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Formats a stored date for an `<input type="date">`. Orders created with the old Material picker hold a
 * UTC timestamp for local midnight, so those are read in local time to land on the day the user picked.
 */
export function toDateInputValue(value: string | null | undefined): string {
  if (!value) return '';
  if (DATE_ONLY.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Group validator: the end date, when both are set, must not be before the start date. */
export function dateRangeValidator(startKey: string, endKey: string): ValidatorFn {
  return group => {
    const start = group.get(startKey)?.value;
    const end = group.get(endKey)?.value;
    return start && end && end < start ? { dateRange: true } : null;
  };
}
