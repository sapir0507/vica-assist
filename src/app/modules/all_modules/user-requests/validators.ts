import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';
import { normalisePlace } from '@vica-assist/shared';

/** `required` accepts a value made only of spaces; this does not. */
export const notBlank = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim() === '' ? { blank: true } : null;

/** Group validator: the origin and the destination must not be the same place. */
export function differentPlaces(originKey: string, destinationKey: string): ValidatorFn {
  return group => {
    const origin = group.get(originKey)?.value;
    const destination = group.get(destinationKey)?.value;
    return normalisePlace(origin) && normalisePlace(origin) === normalisePlace(destination) ? { samePlace: true } : null;
  };
}

/** Form validator: a hotel trip cannot ask for more rooms than there are travelers. */
export const roomsFitTravelers: ValidatorFn = form => {
  const rooms = Number(form.get('preferences.hotel.rooms')?.value);
  const travelers = (form.get('passDetails') as FormArray | null)?.length ?? 0;
  const hotelIncluded = form.get('order')?.value !== 'flight';
  return hotelIncluded && travelers > 0 && rooms > travelers ? { tooManyRooms: true } : null;
};

/** The text may not be longer than `max` characters once surrounding spaces are removed. */
export const maxTrimmed = (max: number): ValidatorFn => control =>
  typeof control.value === 'string' && control.value.trim().length > max ? { tooLong: true } : null;
