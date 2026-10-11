import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarListComponent } from './bar-list.component';

describe('BarListComponent', () => {
  let fixture: ComponentFixture<BarListComponent>;
  const host = () => fixture.nativeElement as HTMLElement;

  const show = (items: { label: string; count: number }[]) => {
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [BarListComponent] });
    fixture = TestBed.createComponent(BarListComponent);
  });

  it('shows each label with its value as text and scales the bars to the largest', () => {
    show([{ label: 'Rome', count: 4 }, { label: 'Paris', count: 1 }]);

    const rows = Array.from(host().querySelectorAll('.bars__row'));
    expect(rows.map(r => r.querySelector('.bars__label')?.textContent)).toEqual(['Rome', 'Paris']);
    expect(rows.map(r => r.querySelector('.bars__value')?.textContent)).toEqual(['4', '1']);
    expect(rows.map(r => (r.querySelector('.bars__fill') as HTMLElement).style.width)).toEqual(['100%', '25%']);
  });

  it('keeps the bars of all-zero data empty instead of dividing by zero', () => {
    show([{ label: '1 star', count: 0 }]);

    expect((host().querySelector('.bars__fill') as HTMLElement).style.width).toBe('0%');
  });

  it('says so when there is nothing to show', () => {
    show([]);

    expect(host().textContent).toContain('No data yet.');
  });
});
