import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { differentPlaces, fullName, israeliId, knownPlace, notBlank, uniqueTravelerIds } from './validators';

describe('notBlank', () => {
  it('rejects empty and whitespace-only text', () => {
    expect(notBlank(new FormControl('   '))).toEqual({ blank: true });
    expect(notBlank(new FormControl(''))).toEqual({ blank: true });
  });

  it('accepts text with something in it', () => {
    expect(notBlank(new FormControl(' Paris '))).toBeNull();
  });

  it('does not judge values that are not text', () => {
    expect(notBlank(new FormControl(12))).toBeNull();
    expect(notBlank(new FormControl(null))).toBeNull();
  });
});

describe('differentPlaces', () => {
  const group = (origin: string, destination: string) =>
    new FormGroup({ origin: new FormControl(origin), destination: new FormControl(destination) }, { validators: differentPlaces('origin', 'destination') });

  it('flags the same place however it is typed', () => {
    expect(group('Paris', 'paris ').errors).toEqual({ samePlace: true });
  });

  it('accepts two different places', () => {
    expect(group('Tel Aviv', 'Paris').errors).toBeNull();
  });

  it('does not complain while the origin is still empty', () => {
    expect(group('', '').errors).toBeNull();
  });
});

describe('israeliId', () => {
  it('accepts a correct ID and leaves an empty value to required', () => {
    expect(israeliId(new FormControl('123456782'))).toBeNull();
    expect(israeliId(new FormControl(''))).toBeNull();
  });

  it('rejects a wrong check digit and non-digits', () => {
    expect(israeliId(new FormControl('123456789'))).toEqual({ israeliId: true });
    expect(israeliId(new FormControl('12345678a'))).toEqual({ israeliId: true });
  });
});

describe('fullName', () => {
  const validate = fullName(20);

  it('accepts first and last names', () => {
    expect(validate(new FormControl('Dana Levi'))).toBeNull();
    expect(validate(new FormControl(''))).toBeNull();
  });

  it('rejects one word, digits and names over the limit from the configuration', () => {
    expect(validate(new FormControl('Dana'))).toEqual({ fullName: true });
    expect(validate(new FormControl('Dana Levi3'))).toEqual({ fullName: true });
    expect(validate(new FormControl('Dana Levi-Cohen-Abramovich'))).toEqual({ fullName: true });
  });
});

describe('knownPlace', () => {
  it('accepts countries and cities and leaves an empty value to required', () => {
    expect(knownPlace(new FormControl('Tel Aviv'))).toBeNull();
    expect(knownPlace(new FormControl('zurich'))).toBeNull();
    expect(knownPlace(new FormControl(''))).toBeNull();
  });

  it('rejects streets and made-up places', () => {
    expect(knownPlace(new FormControl('Flat 5 Main Street'))).toEqual({ unknownPlace: true });
    expect(knownPlace(new FormControl('Atlantis'))).toEqual({ unknownPlace: true });
  });
});

describe('uniqueTravelerIds', () => {
  const travelers = (...ids: string[]) =>
    new FormArray(ids.map(id => new FormGroup({ passID: new FormControl(id) })), { validators: uniqueTravelerIds('passID') });

  it('flags the same ID twice, ignoring leading zeros', () => {
    expect(travelers('123456782', '123456782').errors).toEqual({ duplicateId: true });
    expect(travelers('018', '18').errors).toEqual({ duplicateId: true });
  });

  it('accepts different IDs and ignores empty ones', () => {
    expect(travelers('123456782', '000000018').errors).toBeNull();
    expect(travelers('', '').errors).toBeNull();
  });
});
