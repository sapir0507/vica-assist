import { Directive, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';

export const prefersReducedMotion = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Fades an element in the first time it scrolls into view. Without motion or an observer it is simply shown. */
@Directive({ selector: '[reveal]', standalone: true })
export class RevealDirective implements OnInit, OnDestroy {
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      this.element.classList.add('reveal--visible');
      return;
    }
    this.element.classList.add('reveal');
    this.observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        this.element.classList.add('reveal--visible');
        this.observer?.disconnect();
      }
    }, { threshold: 0.12 });
    this.observer.observe(this.element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
