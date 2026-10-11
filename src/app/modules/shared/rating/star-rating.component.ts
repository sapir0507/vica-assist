import { ChangeDetectionStrategy, Component, ElementRef, inject, input, model } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

const STARS = [1, 2, 3, 4, 5];

@Component({
  standalone: true,
  selector: 'star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule]
})
export class StarRatingComponent {
  readonly stars = STARS;
  label = input.required<string>();
  readonly = input(false);
  value = model<number | null>(null);

  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  isTabStop(star: number): boolean {
    return star === (this.value() ?? 1);
  }

  select(star: number): void {
    this.value.set(star);
  }

  onKeydown(event: KeyboardEvent): void {
    const current = this.value() ?? 0;
    const next = this.nextStar(event.key, current);
    if (next === null) return;

    event.preventDefault();
    this.select(next);
    this.host.nativeElement.querySelectorAll('button')[next - 1].focus();
  }

  private nextStar(key: string, current: number): number | null {
    switch (key) {
      case 'ArrowRight':
      case 'ArrowUp':
        return Math.min(current + 1, STARS.length);
      case 'ArrowLeft':
      case 'ArrowDown':
        return Math.max(current - 1, 1);
      case 'Home':
        return 1;
      case 'End':
        return STARS.length;
      default:
        return null;
    }
  }
}
