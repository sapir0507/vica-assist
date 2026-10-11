import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAppIcons } from '@vica-assist/shared';

import { StarRatingComponent } from './star-rating.component';

describe('StarRatingComponent', () => {
  let fixture: ComponentFixture<StarRatingComponent>;
  const host = () => fixture.nativeElement as HTMLElement;
  const buttons = () => Array.from(host().querySelectorAll<HTMLButtonElement>('button'));
  const lit = () => host().querySelectorAll('.stars__star--on').length;

  const create = (inputs: Record<string, unknown> = {}) => {
    fixture = TestBed.createComponent(StarRatingComponent);
    fixture.componentRef.setInput('label', 'Hotel');
    Object.entries(inputs).forEach(([key, value]) => fixture.componentRef.setInput(key, value));
    fixture.detectChanges();
  };

  beforeEach(() => TestBed.configureTestingModule({ imports: [StarRatingComponent], providers: [provideAppIcons()] }));

  it('lets the user pick a rating and reports it', () => {
    create();
    const picked: (number | null)[] = [];
    fixture.componentInstance.value.subscribe(v => picked.push(v));

    buttons()[3].click();
    fixture.detectChanges();

    expect(picked).toEqual([4]);
    expect(lit()).toBe(4);
    expect(buttons()[3].getAttribute('aria-checked')).toBe('true');
    expect(buttons()[2].getAttribute('aria-checked')).toBe('false');
  });

  it('is a labelled radio group with one tab stop', () => {
    create({ value: 3 });

    expect(host().querySelector('[role="radiogroup"]')?.getAttribute('aria-label')).toBe('Hotel');
    expect(buttons().map(b => b.tabIndex)).toEqual([-1, -1, 0, -1, -1]);
  });

  it('starts the tab stop on the first star while nothing is chosen', () => {
    create();

    expect(buttons().map(b => b.tabIndex)).toEqual([0, -1, -1, -1, -1]);
  });

  it('moves the choice with the arrow keys, Home and End, and stays within 1 to 5', () => {
    create({ value: 5 });
    const press = (key: string) => {
      buttons()[0].dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true }));
      fixture.detectChanges();
    };

    press('ArrowRight');
    expect(fixture.componentInstance.value()).toBe(5);
    press('ArrowLeft');
    expect(fixture.componentInstance.value()).toBe(4);
    press('Home');
    expect(fixture.componentInstance.value()).toBe(1);
    press('ArrowDown');
    expect(fixture.componentInstance.value()).toBe(1);
    press('End');
    expect(fixture.componentInstance.value()).toBe(5);
    expect(buttons()[4].tabIndex).toBe(0);
  });

  it('ignores other keys', () => {
    create({ value: 2 });

    buttons()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));

    expect(fixture.componentInstance.value()).toBe(2);
  });

  it('is a plain image with the value in its label when read-only', () => {
    create({ readonly: true, value: 4 });

    expect(host().querySelector('button')).toBeNull();
    expect(host().querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('Hotel: 4 of 5 stars');
    expect(lit()).toBe(4);
  });
});
