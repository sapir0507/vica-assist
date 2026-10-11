import { Feedback } from './interfaces/final-order.interface';
import { toDateInputValue } from './dates';

export const REVIEW_MAX_LENGTH = 500;

export type RatedPart = 'hotel' | 'flight';

export interface FeedbackInput {
  hotelRating?: number | null;
  flightRating?: number | null;
  review?: string | null;
}

export function bookedParts(choice: string | undefined): RatedPart[] {
  if (choice === 'both') return ['hotel', 'flight'];
  if (choice === 'hotel' || choice === 'flight') return [choice];
  return [];
}

export function isValidRating(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 5;
}

export function hasTripEnded(returnDate: string | undefined, now = new Date()): boolean {
  const lastDay = toDateInputValue(returnDate);
  return lastDay !== '' && lastDay < toDateInputValue(now.toISOString());
}

/** Returns the feedback to store, or `null` when a booked part has no valid rating or the review is too long. */
export function toFeedback(parts: RatedPart[], input: FeedbackInput, now = new Date()): Feedback | null {
  if (parts.length === 0) return null;

  const review = (input.review ?? '').trim();
  if (review.length > REVIEW_MAX_LENGTH) return null;

  const feedback: Feedback = { ratedAt: now.toISOString() };
  for (const part of parts) {
    const rating = input[`${part}Rating`];
    if (!isValidRating(rating)) return null;
    feedback[`${part}Rating`] = rating;
  }
  if (review) feedback.review = review;
  return feedback;
}
