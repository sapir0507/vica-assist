import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** `required` accepts a value made only of spaces; this does not. */
export const notBlank = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim() === '' ? { blank: true } : null;

/** Group validator: the origin and the destination must not be the same place. */
export function differentPlaces(originKey: string, destinationKey: string): ValidatorFn {
  return group => {
    const origin = group.get(originKey)?.value;
    const destination = group.get(destinationKey)?.value;
    const normalise = (value: unknown) => String(value ?? '').trim().toLowerCase();
    return normalise(origin) && normalise(origin) === normalise(destination) ? { samePlace: true } : null;
  };
}
