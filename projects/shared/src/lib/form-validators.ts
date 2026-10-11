import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';

import { isKnownPlace, isValidFullName, isValidIsraeliId } from './order-matching';

const isEmpty = (control: AbstractControl): boolean => control.value === null || control.value === undefined || control.value === '';

export const israeliId = (control: AbstractControl): ValidationErrors | null =>
  isEmpty(control) || isValidIsraeliId(control.value) ? null : { israeliId: true };

export const fullName = (maxLength: number): ValidatorFn => control =>
  isEmpty(control) || isValidFullName(control.value, maxLength) ? null : { fullName: true };

export const knownPlace = (control: AbstractControl): ValidationErrors | null =>
  isEmpty(control) || isKnownPlace(control.value) ? null : { unknownPlace: true };

/** Array validator: two travelers cannot have the same ID, however it is written. */
export const uniqueTravelerIds = (idKey: string): ValidatorFn => control => {
  const ids = (control as FormArray).controls
    .map(traveler => String(traveler.get(idKey)?.value ?? '').trim().replace(/^0+/, ''))
    .filter(id => id !== '');
  return new Set(ids).size === ids.length ? null : { duplicateId: true };
};
