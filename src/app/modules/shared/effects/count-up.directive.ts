import { Directive, ElementRef, effect, inject, input } from '@angular/core';

import { prefersReducedMotion } from './reveal.directive';

const DURATION_MS = 900;

/** Shows a number, counting up to it when it appears or changes; shown at once when motion is reduced. */
@Directive({ selector: '[countUp]', standalone: true })
export class CountUpDirective {
  value = input.required<number | null | undefined>({ alias: 'countUp' });
  decimals = input(0, { alias: 'countUpDecimals' });
  prefix = input('', { alias: 'countUpPrefix' });
  suffix = input('', { alias: 'countUpSuffix' });

  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private shown = 0;
  private frame = 0;

  constructor() {
    effect(onCleanup => {
      const target = this.value();
      if (target === null || target === undefined || !Number.isFinite(target)) {
        this.element.textContent = 'n/a';
        return;
      }
      onCleanup(() => cancelAnimationFrame(this.frame));
      this.run(target);
    });
  }

  private write(value: number): void {
    this.shown = value;
    this.element.textContent = `${this.prefix()}${value.toLocaleString('en', {
      minimumFractionDigits: this.decimals(),
      maximumFractionDigits: this.decimals()
    })}${this.suffix()}`;
  }

  private run(target: number): void {
    if (prefersReducedMotion() || typeof requestAnimationFrame !== 'function') {
      this.write(target);
      return;
    }
    const from = this.shown;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / DURATION_MS, 1);
      const eased = 1 - (1 - progress) ** 3;
      this.write(from + (target - from) * eased);
      if (progress < 1) this.frame = requestAnimationFrame(step);
    };
    this.frame = requestAnimationFrame(step);
  }
}
