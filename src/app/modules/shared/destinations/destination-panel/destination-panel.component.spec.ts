import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PublicSummary } from '@vica-assist/shared';

import { DESTINATIONS } from '../destinations';
import { DestinationPanelComponent } from './destination-panel.component';

const summary = (sufficient: boolean): PublicSummary => ({
  updatedAt: 'x',
  bookings: 9,
  sufficient,
  averageRating: 4.5,
  pleasedPercent: 90,
  averageResponseHours: 5,
  topDestinations: [{ name: 'Paris', count: 4, rating: 4.6, averagePrice: 1020 }, { name: 'Rome', count: 2, rating: null, averagePrice: null }],
  reviews: [{ firstName: 'Noa', destination: 'Paris', text: 'Loved <i>every</i> minute', hotelRating: 5 }, { firstName: 'Dan', destination: 'Rome', text: 'Quiet' }],
  agents: [],
  airlines: []
});

describe('DestinationPanelComponent', () => {
  let fixture: ComponentFixture<DestinationPanelComponent>;
  const host = () => fixture.nativeElement as HTMLElement;
  const dialog = () => host().querySelector('dialog') as HTMLDialogElement;
  const text = () => host().textContent?.replace(/\s+/g, ' ') ?? '';
  const paris = DESTINATIONS[0];
  const fact = (label: string) =>
    Array.from(host().querySelectorAll('dt')).find(dt => dt.textContent === label)?.nextElementSibling?.textContent;

  const show = (destination: typeof paris | null, data: PublicSummary | null = null) => {
    fixture.componentRef.setInput('destination', destination);
    fixture.componentRef.setInput('summary', data);
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DestinationPanelComponent], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(DestinationPanelComponent);
    fixture.detectChanges();
  });

  it('is closed until a destination is chosen, then open', () => {
    expect(dialog().open).toBe(false);

    show(paris);
    expect(dialog().open).toBe(true);
    expect(dialog().getAttribute('aria-labelledby')).toBe('panel-title');
    expect(text()).toContain('Paris');
  });

  it('shows the facts that go with the destination', () => {
    show(paris);

    expect(fact('Best time to go')).toBe('April to June');
    expect(fact('Flight from Tel Aviv')).toBe('about 4.5 hours');
    expect(fact('Currency')).toBe('Euro');
  });

  it('shows what travelers did and said when there is enough real data', () => {
    show(paris, summary(true));

    expect(fact('Trips arranged')).toBe('4');
    expect(fact('Average rating')).toBe('4.6 / 5');
    expect(fact('Average trip cost')).toBe('$1,020');
    expect(text()).toContain('Loved <i>every</i> minute');
    expect(host().querySelector('.panel__reviews i')).toBeNull();
    expect(text()).not.toContain('Quiet');
  });

  it('leaves out the numbers when there is too little data, and the ones it does not have', () => {
    show(paris, summary(false));
    expect(text()).not.toContain('Trips arranged');
    expect(text()).not.toContain('What travelers say');

    show({ ...DESTINATIONS[0], name: 'Rome', facts: undefined }, summary(true));
    expect(fact('Trips arranged')).toBe('2');
    expect(fact('Average rating')).toBeUndefined();
    expect(text()).not.toContain('Good to know');
  });

  it('has a sign-in button that remembers the destination, and an account link that does too', () => {
    show(paris);

    const links = Array.from(host().querySelectorAll<HTMLAnchorElement>('.panel__actions a'));
    expect(links[0].textContent?.trim()).toBe('Sign in to plan a trip to Paris');
    expect(links[0].getAttribute('href')).toBe('/login?destination=Paris');
    expect(links[1].getAttribute('href')).toBe('/register?destination=Paris');
  });

  it('closes with its button and with a click on the backdrop', () => {
    let closed = 0;
    fixture.componentInstance.closed.subscribe(() => closed++);
    show(paris);

    host().querySelector<HTMLButtonElement>('.panel__close')?.click();
    expect(dialog().open).toBe(false);

    show(null);
    show(paris);
    expect(dialog().open).toBe(true);
    dialog().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(dialog().open).toBe(false);
    expect(closed).toBe(2);
  });

  it('tells the page when the dialog was closed, so it can forget the destination', () => {
    let closed = 0;
    fixture.componentInstance.closed.subscribe(() => closed++);
    show(paris);

    dialog().dispatchEvent(new Event('close'));

    expect(closed).toBe(1);
  });

  it('does not close when something inside it is clicked', () => {
    show(paris);

    host().querySelector<HTMLElement>('.panel__lead')?.click();

    expect(dialog().open).toBe(true);
  });

  it('closes when the destination is cleared', () => {
    show(paris);
    show(null);

    expect(dialog().open).toBe(false);
  });
});
