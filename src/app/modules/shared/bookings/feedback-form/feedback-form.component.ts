import { ChangeDetectionStrategy, Component, OnInit, input, output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Feedback, FeedbackInput, isValidRating, RatedPart, REVIEW_MAX_LENGTH } from '@vica-assist/shared';

import { StarRatingComponent } from '../../rating/star-rating.component';

const ratingValidator = (control: AbstractControl): ValidationErrors | null =>
  control.value === null || isValidRating(control.value) ? null : { rating: true };

const reviewValidator = (control: AbstractControl): ValidationErrors | null =>
  (control.value as string).trim().length > REVIEW_MAX_LENGTH ? { reviewLength: true } : null;

@Component({
  standalone: true,
  selector: 'feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatButtonModule, StarRatingComponent]
})
export class FeedbackFormComponent implements OnInit {
  parts = input.required<RatedPart[]>();
  initial = input<Feedback>();
  idPrefix = input('feedback');
  submitted = output<FeedbackInput>();
  cancelled = output<void>();

  readonly maxLength = REVIEW_MAX_LENGTH;
  readonly partLabels: Record<RatedPart, string> = { hotel: 'Hotel', flight: 'Flight' };

  readonly review = new FormControl('', { nonNullable: true, validators: [reviewValidator] });
  readonly ratings: Partial<Record<RatedPart, FormControl<number | null>>> = {};
  form = new FormGroup<Record<string, AbstractControl>>({ review: this.review });

  ngOnInit(): void {
    for (const part of this.parts()) {
      const control = new FormControl<number | null>(this.initial()?.[`${part}Rating`] ?? null, [Validators.required, ratingValidator]);
      this.ratings[part] = control;
      this.form.addControl(`${part}Rating`, control);
    }
    this.review.setValue(this.initial()?.review ?? '');
  }

  setRating(part: RatedPart, rating: number | null): void {
    this.ratings[part]?.setValue(rating);
  }

  submit(): void {
    if (this.form.invalid) return;
    this.submitted.emit({
      hotelRating: this.ratings.hotel?.value,
      flightRating: this.ratings.flight?.value,
      review: this.review.value
    });
  }
}
