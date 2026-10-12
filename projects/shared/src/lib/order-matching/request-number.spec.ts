import { requestNumber } from './request-number';

describe('requestNumber', () => {
  it('turns the order id into a padded, prefixed code a customer can quote', () => {
    expect(requestNumber({ id: 12 })).toBe('VA-000012');
  });

  it('keeps ids longer than the padding intact', () => {
    expect(requestNumber({ id: 1234567 })).toBe('VA-1234567');
  });
});
