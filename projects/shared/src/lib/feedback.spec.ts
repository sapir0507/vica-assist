import { bookedParts, hasTripEnded, isValidRating, REVIEW_MAX_LENGTH, toFeedback } from './feedback';

describe('bookedParts', () => {
  it('maps the order choice to the parts that can be rated', () => {
    expect(bookedParts('both')).toEqual(['hotel', 'flight']);
    expect(bookedParts('hotel')).toEqual(['hotel']);
    expect(bookedParts('flight')).toEqual(['flight']);
  });

  it('has nothing to rate for an unknown choice', () => {
    expect(bookedParts('cruise')).toEqual([]);
    expect(bookedParts(undefined)).toEqual([]);
  });
});

describe('isValidRating', () => {
  it('accepts whole numbers from 1 to 5', () => {
    [1, 2, 3, 4, 5].forEach(rating => expect(isValidRating(rating)).toBe(true));
  });

  it('rejects everything else', () => {
    [0, 6, -1, 2.5, NaN, '4', null, undefined].forEach(rating => expect(isValidRating(rating)).toBe(false));
  });
});

describe('hasTripEnded', () => {
  const now = new Date(2026, 5, 20, 12, 0);

  it('is true from the day after the return date', () => {
    expect(hasTripEnded('2026-06-19', now)).toBe(true);
  });

  it('is false on the return date and before it', () => {
    expect(hasTripEnded('2026-06-20', now)).toBe(false);
    expect(hasTripEnded('2026-07-01', now)).toBe(false);
  });

  it('is false when the date is missing or invalid', () => {
    expect(hasTripEnded(undefined, now)).toBe(false);
    expect(hasTripEnded('soon', now)).toBe(false);
  });
});

describe('toFeedback', () => {
  const now = new Date('2026-06-20T10:00:00.000Z');

  it('keeps only the booked parts and trims the review', () => {
    expect(toFeedback(['hotel'], { hotelRating: 5, flightRating: 1, review: '  Lovely  ' }, now)).toEqual({
      hotelRating: 5,
      review: 'Lovely',
      ratedAt: '2026-06-20T10:00:00.000Z'
    });
  });

  it('treats a blank review as no review', () => {
    expect(toFeedback(['flight'], { flightRating: 4, review: '   ' }, now)).toEqual({
      flightRating: 4,
      ratedAt: '2026-06-20T10:00:00.000Z'
    });
  });

  it('refuses a missing or out-of-range rating for a booked part', () => {
    expect(toFeedback(['hotel', 'flight'], { hotelRating: 5 }, now)).toBeNull();
    expect(toFeedback(['hotel'], { hotelRating: 0 }, now)).toBeNull();
    expect(toFeedback(['hotel'], { hotelRating: 3.5 }, now)).toBeNull();
  });

  it('refuses a review that is too long, counted after trimming', () => {
    expect(toFeedback(['hotel'], { hotelRating: 5, review: 'a'.repeat(REVIEW_MAX_LENGTH + 1) }, now)).toBeNull();
    expect(toFeedback(['hotel'], { hotelRating: 5, review: ` ${'a'.repeat(REVIEW_MAX_LENGTH)} ` }, now)).not.toBeNull();
  });

  it('refuses when nothing was booked', () => {
    expect(toFeedback([], { hotelRating: 5 }, now)).toBeNull();
  });
});
