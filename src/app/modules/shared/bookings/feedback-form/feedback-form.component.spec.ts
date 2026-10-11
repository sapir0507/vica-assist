import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedbackInput, Feedback, provideAppIcons, REVIEW_MAX_LENGTH, RatedPart } from '@vica-assist/shared';

import { FeedbackFormComponent } from './feedback-form.component';

describe('FeedbackFormComponent', () => {
  let fixture: ComponentFixture<FeedbackFormComponent>;
  let sent: FeedbackInput[];
  const host = () => fixture.nativeElement as HTMLElement;
  const submitButton = () => host().querySelector<HTMLButtonElement>('button[type="submit"]') as HTMLButtonElement;
  const stars = (group: number, star: number) =>
    host().querySelectorAll<HTMLElement>('star-rating')[group].querySelectorAll<HTMLButtonElement>('button')[star - 1];
  const writeReview = (text: string) => {
    const area = host().querySelector('textarea') as HTMLTextAreaElement;
    area.value = text;
    area.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  const create = (parts: RatedPart[], initial?: Feedback) => {
    fixture = TestBed.createComponent(FeedbackFormComponent);
    fixture.componentRef.setInput('parts', parts);
    if (initial) fixture.componentRef.setInput('initial', initial);
    sent = [];
    fixture.componentInstance.submitted.subscribe(value => sent.push(value));
    fixture.detectChanges();
  };
  const click = (button: HTMLElement) => {
    button.click();
    fixture.detectChanges();
  };

  beforeEach(() => TestBed.configureTestingModule({ imports: [FeedbackFormComponent], providers: [provideAppIcons()] }));

  it('asks for a rating of every booked part and nothing else', () => {
    create(['hotel']);
    expect(host().querySelectorAll('star-rating')).toHaveLength(1);

    create(['hotel', 'flight']);
    expect(host().querySelectorAll('star-rating')).toHaveLength(2);
  });

  it('cannot be sent until every booked part has a rating, and says why', () => {
    create(['hotel', 'flight']);
    expect(submitButton().disabled).toBe(true);
    expect(host().textContent).toContain('1 to 5 stars');

    click(stars(0, 5));
    expect(submitButton().disabled).toBe(true);

    click(stars(1, 4));
    expect(submitButton().disabled).toBe(false);
    expect(host().textContent).not.toContain('1 to 5 stars');
  });

  it('sends the ratings and the review as typed', () => {
    create(['hotel', 'flight']);
    click(stars(0, 5));
    click(stars(1, 3));
    writeReview('  Wonderful trip  ');

    click(submitButton());

    expect(sent).toEqual([{ hotelRating: 5, flightRating: 3, review: '  Wonderful trip  ' }]);
  });

  it('does not send anything while invalid', () => {
    create(['hotel']);

    fixture.componentInstance.submit();

    expect(sent).toEqual([]);
  });

  it('refuses a review over the limit, counting without surrounding spaces', () => {
    create(['hotel']);
    click(stars(0, 4));

    writeReview('a'.repeat(REVIEW_MAX_LENGTH + 1));
    expect(submitButton().disabled).toBe(true);
    expect(host().querySelector('[role="alert"]')?.textContent).toContain(`${REVIEW_MAX_LENGTH} characters`);

    writeReview(` ${'a'.repeat(REVIEW_MAX_LENGTH)} `);
    expect(submitButton().disabled).toBe(false);
    expect(host().querySelector('[role="alert"]')).toBeNull();
  });

  it('is prefilled when editing, and can be cancelled', () => {
    create(['hotel'], { hotelRating: 2, review: 'Noisy', ratedAt: '2026-06-20T10:00:00.000Z' });
    const cancelled: boolean[] = [];
    fixture.componentInstance.cancelled.subscribe(() => cancelled.push(true));

    expect((host().querySelector('textarea') as HTMLTextAreaElement).value).toBe('Noisy');
    expect(stars(0, 2).getAttribute('aria-checked')).toBe('true');
    expect(submitButton().disabled).toBe(false);

    click(Array.from(host().querySelectorAll('button')).find(b => b.textContent?.includes('Cancel')) as HTMLElement);
    expect(cancelled).toEqual([true]);
  });

  it('gives its fields ids that are unique per booking', () => {
    create(['hotel']);
    fixture.componentRef.setInput('idPrefix', 'feedback-7');
    fixture.detectChanges();

    expect(host().querySelector('textarea')?.id).toBe('feedback-7-review');
    expect(host().querySelector('label')?.getAttribute('for')).toBe('feedback-7-review');
  });
});
