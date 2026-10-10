import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAppIcons } from '@vica-assist/shared';

import { DESTINATIONS } from '../../destinations/destinations';
import { GenericHomepageComponent } from './generic-homepage.component';

describe('GenericHomepageComponent', () => {
  let fixture: ComponentFixture<GenericHomepageComponent>;
  const host = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericHomepageComponent],
      providers: [provideRouter([]), provideAppIcons()]
    }).compileComponents();

    fixture = TestBed.createComponent(GenericHomepageComponent);
    fixture.detectChanges();
  });

  it('invites visitors to register', () => {
    const cta = host().querySelector<HTMLAnchorElement>('.hero__cta');

    expect(cta?.getAttribute('href')).toBe('/register');
  });

  it('shows a card for every trending destination', () => {
    expect(host().querySelectorAll('destination-card')).toHaveLength(DESTINATIONS.length);
    expect(host().textContent).toContain('Flights from $420');
  });

  it('lists what the service offers', () => {
    expect(host().querySelectorAll('.trust__item')).toHaveLength(3);
  });
});
