import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountUpDirective } from './count-up.directive';
import { RevealDirective } from './reveal.directive';

@Component({
  standalone: true,
  imports: [RevealDirective, CountUpDirective],
  template: `<section id="box" reveal><b id="n" [countUp]="value()" [countUpDecimals]="decimals()" countUpPrefix="$" countUpSuffix="k"></b></section>`
})
class HostComponent {
  value = signal<number | null>(1200);
  decimals = signal(0);
}

type Observed = { callback: (entries: Partial<IntersectionObserverEntry>[]) => void; disconnected: boolean };

describe('motion effects', () => {
  let fixture: ComponentFixture<HostComponent>;
  const box = () => (fixture.nativeElement as HTMLElement).querySelector('#box') as HTMLElement;
  const number = () => (fixture.nativeElement as HTMLElement).querySelector('#n') as HTMLElement;
  let observers: Observed[];

  const reduceMotion = (reduce: boolean) => vi.stubGlobal('matchMedia', () => ({ matches: reduce }));
  const fakeObserver = () => {
    observers = [];
    vi.stubGlobal('IntersectionObserver', class {
      state: Observed;
      constructor(callback: Observed['callback']) {
        this.state = { callback, disconnected: false };
        observers.push(this.state);
      }
      observe() { /* the test triggers it */ }
      disconnect() { this.state.disconnected = true; }
    });
  };
  const create = () => {
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  };

  afterEach(() => vi.unstubAllGlobals());

  describe('reveal', () => {
    it('shows the element at once when motion is reduced', () => {
      reduceMotion(true);
      create();

      expect(box().classList).toContain('reveal--visible');
      expect(box().classList).not.toContain('reveal');
    });

    it('shows the element at once when there is no observer', () => {
      reduceMotion(false);
      vi.stubGlobal('IntersectionObserver', undefined);
      create();

      expect(box().classList).toContain('reveal--visible');
    });

    it('hides it until it scrolls into view, then shows it once and stops watching', () => {
      reduceMotion(false);
      fakeObserver();
      create();
      expect(box().classList).toContain('reveal');
      expect(box().classList).not.toContain('reveal--visible');

      observers[0].callback([{ isIntersecting: false }]);
      expect(box().classList).not.toContain('reveal--visible');

      observers[0].callback([{ isIntersecting: true }]);
      expect(box().classList).toContain('reveal--visible');
      expect(observers[0].disconnected).toBe(true);
    });

    it('stops watching when the element is removed', () => {
      reduceMotion(false);
      fakeObserver();
      create();

      fixture.destroy();

      expect(observers[0].disconnected).toBe(true);
    });
  });

  describe('count up', () => {
    it('shows the number at once when motion is reduced, with its prefix and suffix', () => {
      reduceMotion(true);
      create();

      expect(number().textContent).toBe('$1,200k');
    });

    it('shows n/a for a missing or invalid number', () => {
      reduceMotion(true);
      create();

      fixture.componentInstance.value.set(null);
      fixture.detectChanges();
      expect(number().textContent).toBe('n/a');

      fixture.componentInstance.value.set(NaN);
      fixture.detectChanges();
      expect(number().textContent).toBe('n/a');
    });

    it('follows a change in the number and its decimals', () => {
      reduceMotion(true);
      create();

      fixture.componentInstance.decimals.set(1);
      fixture.componentInstance.value.set(4.56);
      fixture.detectChanges();

      expect(number().textContent).toBe('$4.6k');
    });

    it('counts up to the number over a short time when motion is allowed', () => {
      reduceMotion(false);
      let now = 0;
      let pending: ((time: number) => void) | undefined;
      vi.stubGlobal('requestAnimationFrame', (callback: (time: number) => void) => { pending = callback; return 1; });
      vi.stubGlobal('cancelAnimationFrame', () => { pending = undefined; });
      vi.spyOn(performance, 'now').mockImplementation(() => now);
      create();

      now = 450;
      pending?.(now);
      const halfway = Number(number().textContent?.replace(/[^\d.]/g, ''));
      expect(halfway).toBeGreaterThan(0);
      expect(halfway).toBeLessThan(1200);

      now = 1000;
      pending?.(now);
      expect(number().textContent).toBe('$1,200k');
    });

    it('waits at zero until the number scrolls into view, then counts once', () => {
      reduceMotion(false);
      fakeObserver();
      const frames: ((time: number) => void)[] = [];
      vi.stubGlobal('requestAnimationFrame', (callback: (time: number) => void) => { frames.push(callback); return 1; });
      vi.stubGlobal('cancelAnimationFrame', () => undefined);
      vi.spyOn(performance, 'now').mockReturnValue(0);
      create();

      const countObserver = observers[observers.length - 1];
      expect(number().textContent).toBe('$0k');
      expect(frames.length).toBe(0);

      countObserver.callback([{ isIntersecting: true }]);
      expect(frames.length).toBe(1);
      frames[0](1000);
      expect(number().textContent).toBe('$1,200k');
      expect(countObserver.disconnected).toBe(true);
    });
  });
});
