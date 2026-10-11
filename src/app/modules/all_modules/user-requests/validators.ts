import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isKnownPlace, isValidFullName, isValidIsraeliId, normalisePlace } from '@vica-assist/shared';

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

const isEmpty = (control: AbstractControl): boolean => control.value === null || control.value === undefined || control.value === '';

export const israeliId = (control: AbstractControl): ValidationErrors | null =>
  isEmpty(control) || isValidIsraeliId(control.value) ? null : { israeliId: true };

export const fullName = (maxLength: number): ValidatorFn => control =>
  isEmpty(control) || isValidFullName(control.value, maxLength) ? null : { fullName: true };

export const knownPlace = (control: AbstractControl): ValidationErrors | null =>
  isEmpty(control) || isKnownPlace(control.value) ? null : { unknownPlace: true };

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

/** Array validator: two travelers cannot have the same ID, however it is written. */
export const uniqueTravelerIds = (idKey: string): ValidatorFn => control => {
  const ids = (control as FormArray).controls
    .map(traveler => String(traveler.get(idKey)?.value ?? '').trim().replace(/^0+/, ''))
    .filter(id => id !== '');
  return new Set(ids).size === ids.length ? null : { duplicateId: true };
};
