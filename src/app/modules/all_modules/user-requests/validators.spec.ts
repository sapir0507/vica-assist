import { FormControl, FormGroup } from '@angular/forms';

import { differentPlaces, notBlank } from './validators';

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
