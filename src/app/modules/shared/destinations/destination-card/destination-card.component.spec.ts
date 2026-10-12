import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DESTINATIONS, Destination } from '../destinations';
import { DestinationCardComponent } from './destination-card.component';

describe('DestinationCardComponent', () => {
  let fixture: ComponentFixture<DestinationCardComponent>;
  const host = () => fixture.nativeElement as HTMLElement;
  const paris: Destination = DESTINATIONS[0];

  const create = (inputs: Record<string, unknown>) => {
    fixture = TestBed.createComponent(DestinationCardComponent);
    fixture.componentRef.setInput('destination', paris);
    Object.entries(inputs).forEach(([key, value]) => fixture.componentRef.setInput(key, value));
    fixture.detectChanges();
  };

  beforeEach(() => TestBed.configureTestingModule({ imports: [DestinationCardComponent] }));

  it('is plain content when it is not a picker', () => {
    create({});

    expect(host().querySelector('button')).toBeNull();
    expect(host().textContent).toContain('Paris');
  });

  it('emits the destination and reports its state when used as a picker', () => {
    create({ selectable: true, selected: true });
    const chosen: Destination[] = [];
    fixture.componentInstance.chosen.subscribe(d => chosen.push(d));

    const button = host().querySelector('button') as HTMLButtonElement;
    button.click();

    expect(button.getAttribute('role')).toBe('radio');
    expect(button.getAttribute('aria-checked')).toBe('true');
    expect(chosen).toEqual([paris]);
  });

  it('opens something without pretending to be a radio button', () => {
    create({ opens: true });
    const chosen: Destination[] = [];
    fixture.componentInstance.chosen.subscribe(d => chosen.push(d));

    const button = host().querySelector('button') as HTMLButtonElement;
    button.click();

    expect(button.getAttribute('role')).toBeNull();
    expect(button.getAttribute('aria-checked')).toBeNull();
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');
    expect(chosen).toEqual([paris]);
  });

  it('shows the note instead of the flight price when it has one', () => {
    create({});
    expect(host().textContent).toContain('Flights from $420');

    fixture.componentRef.setInput('destination', { ...paris, note: 'Chosen by 4 travelers' });
    fixture.detectChanges();
    expect(host().textContent).toContain('Chosen by 4 travelers');
    expect(host().textContent).not.toContain('Flights from');
  });
});
