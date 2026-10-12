import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { API_URL, provideAppIcons, PublicSummary } from '@vica-assist/shared';

import { DESTINATIONS } from '../../destinations/destinations';
import { GenericHomepageComponent } from './generic-homepage.component';

const summary = (overrides: Partial<PublicSummary> = {}): PublicSummary => ({
  updatedAt: 'x',
  bookings: 9,
  sufficient: true,
  averageRating: 4.5,
  pleasedPercent: 90,
  averageResponseHours: 5.5,
  topDestinations: [
    { name: 'Rome', count: 3, rating: 4.5, averagePrice: 900 },
    { name: 'Paris', count: 2, rating: 4, averagePrice: 1100 },
    { name: 'Lima', count: 1, rating: null, averagePrice: null }
  ],
  reviews: [{ firstName: 'Noa', destination: 'Rome', text: 'Loved <b>every</b> minute', hotelRating: 5, flightRating: 4 }],
  agents: [{ name: 'Maya Cohen', title: 'Senior travel agent', languages: ['Hebrew', 'English'], specialties: ['Paris'], rating: 4.5, reviews: 3 }],
  airlines: ['El Al', 'Lufthansa'],
  ...overrides
});

describe('GenericHomepageComponent', () => {
  let fixture: ComponentFixture<GenericHomepageComponent>;
  let httpMock: HttpTestingController;
  const host = () => fixture.nativeElement as HTMLElement;
  const text = () => host().textContent?.replace(/\s+/g, ' ') ?? '';

  const create = (published: PublicSummary | null) => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, GenericHomepageComponent],
      providers: [provideRouter([]), provideAppIcons(), { provide: API_URL, useValue: 'http://localhost:3000/' }]
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(GenericHomepageComponent);
    fixture.detectChanges();
    const request = httpMock.expectOne('http://localhost:3000/publicSummary/1');
    if (published) request.flush(published);
    else request.flush('missing', { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();
  };

  beforeEach(() => vi.stubGlobal('matchMedia', () => ({ matches: true })));

  afterEach(() => {
    httpMock.verify();
    vi.unstubAllGlobals();
  });

  it('invites visitors to register', () => {
    create(null);
    const cta = host().querySelector<HTMLAnchorElement>('.hero__cta');

    expect(cta?.getAttribute('href')).toBe('/register');
    expect(cta?.textContent).toContain('Create an account');
  });

  it('is information only: no booking wording and no booking form, picker or dates', () => {
    create(summary());

    expect(text()).not.toMatch(/book/i);
    expect(host().querySelector('[role="radio"], input[type="date"], userRequests, destination-card[ng-reflect-selectable="true"]')).toBeNull();
    expect(host().querySelectorAll('form')).toHaveLength(1);
    expect(host().querySelector('form')?.getAttribute('aria-label')).toBe('Ask us a question');
  });

  it('only ever asks for the public summary, never for any customer, agent or order data', () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, GenericHomepageComponent],
      providers: [provideRouter([]), provideAppIcons(), { provide: API_URL, useValue: 'http://localhost:3000/' }]
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(GenericHomepageComponent);
    fixture.detectChanges();

    const urls = httpMock.match(() => true).map(request => request.request.url);

    expect(urls).toEqual(['http://localhost:3000/publicSummary/1']);
  });

  it('explains how it works in four steps, with the promised time', () => {
    create(null);

    expect(host().querySelectorAll('.steps__item')).toHaveLength(4);
    expect(text()).toContain('usually within 24 hours');
  });

  describe('the trending destinations', () => {
    it('are the sample six until there is enough real data', () => {
      create(null);

      expect(host().querySelectorAll('destination-card')).toHaveLength(DESTINATIONS.length);
      expect(text()).toContain('Flights from $420');
    });

    it('are the places travelers chose once there is enough real data', () => {
      create(summary());

      expect(Array.from(host().querySelectorAll('.destination__name')).map(n => n.textContent)).toEqual(['Rome', 'Paris', 'Lima']);
      expect(text()).toContain('Chosen by 3 travelers');
    });

    it('open a panel with what we know, and a sign-in button that remembers the place', () => {
      create(summary());

      host().querySelectorAll<HTMLButtonElement>('destination-card button')[1].click();
      fixture.detectChanges();

      const dialog = host().querySelector('dialog') as HTMLDialogElement;
      expect(dialog.open).toBe(true);
      expect(dialog.textContent).toContain('Best time to go');
      expect(dialog.querySelector('.panel__actions a')?.getAttribute('href')).toBe('/login?destination=Paris');
      expect(host().querySelector('destination-card button')?.getAttribute('aria-haspopup')).toBe('dialog');
    });

    it('forget the choice when the panel closes', () => {
      create(summary());
      host().querySelector<HTMLButtonElement>('destination-card button')?.click();
      fixture.detectChanges();

      host().querySelector('dialog')?.dispatchEvent(new Event('close'));
      fixture.detectChanges();

      expect(fixture.componentInstance.chosen()).toBeNull();
    });
  });

  describe('what the public summary adds', () => {
    it('shows the agents, the airlines, the numbers and the reviews', () => {
      create(summary());

      expect(text()).toContain('Meet our agents');
      expect(text()).toContain('Maya Cohen');
      expect(host().querySelector('.agent__avatar')?.textContent).toBe('MC');
      expect(text()).toContain('4.5 from 3 reviews');
      expect(Array.from(host().querySelectorAll('.airlines__item')).map(i => i.textContent)).toEqual(['El Al', 'Lufthansa']);
      expect(host().querySelectorAll('.stat')).toHaveLength(4);
      expect(host().querySelector('.stat__value')?.textContent).toBe('9');
      expect(text()).toContain('Noa, Rome');
    });

    it('shows reviews as text only', () => {
      create(summary());

      expect(host().querySelector('.review__text')?.textContent).toBe('Loved <b>every</b> minute');
      expect(host().querySelector('.review__text b')).toBeNull();
    });

    it('says it is just getting started, with no numbers or reviews, when there is too little data', () => {
      create(summary({ sufficient: false, reviews: [], averageRating: null, pleasedPercent: null, averageResponseHours: null, topDestinations: [] }));

      expect(text()).toContain('We are just getting started');
      expect(host().querySelector('.stats')).toBeNull();
      expect(text()).not.toContain('What travelers say');
    });

    it('leaves out the sections it has nothing for, and shows nothing at all before a summary exists', () => {
      create(summary({ agents: [], airlines: [] }));
      expect(text()).not.toContain('Meet our agents');
      expect(text()).not.toContain('Airlines we work with');

      TestBed.resetTestingModule();
      create(null);
      expect(text()).not.toContain('The service in numbers');
    });

    it('does not call an agent without ratings rated', () => {
      create(summary({ agents: [{ name: 'New Agent', title: 'Agent', languages: ['English'], specialties: [], rating: null, reviews: 0 }] }));

      expect(host().querySelector('.agent__rating')).toBeNull();
    });
  });

  it('answers common questions in expandable items, using the real airlines', () => {
    create(summary());

    const items = host().querySelectorAll('details.faq__item');
    expect(items).toHaveLength(6);
    expect(items[0].querySelector('summary')?.textContent).toBe('How fast will I hear back?');
    expect(text()).toContain('El Al, Lufthansa.');
  });

  it('says a bag depends on the airline, without promising one', () => {
    create(null);

    expect(text()).toContain('It depends on the airline and the fare.');
  });

  it('has a contact form for questions', () => {
    create(null);

    expect(host().querySelector('contact-form')).not.toBeNull();
    expect(text()).toContain('Ask us a question');
  });

  it('lists what the service offers', () => {
    create(null);

    expect(host().querySelectorAll('.trust__item')).toHaveLength(3);
  });

  it('gives every section a heading', () => {
    create(summary());

    host().querySelectorAll('section[aria-labelledby]').forEach(section => {
      const id = section.getAttribute('aria-labelledby') as string;
      expect(host().querySelector(`#${id}`)).not.toBeNull();
    });
  });
});
