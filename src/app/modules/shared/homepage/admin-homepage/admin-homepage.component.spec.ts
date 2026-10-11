import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { API_URL, provideAppIcons } from '@vica-assist/shared';

import { SessionStore } from 'src/app/services/session/session.store';
import { AdminHomepageComponent, ADMIN_SECTIONS } from './admin-homepage.component';

type Observed = { callback: (entries: Partial<IntersectionObserverEntry>[]) => void; targets: Element[]; disconnected: boolean };

describe('AdminHomepageComponent', () => {
  let fixture: ComponentFixture<AdminHomepageComponent>;
  let observers: Observed[];
  const host = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => {
    observers = [];
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    vi.stubGlobal('IntersectionObserver', class {
      state: Observed;
      constructor(callback: Observed['callback']) {
        this.state = { callback, targets: [], disconnected: false };
        observers.push(this.state);
      }
      observe(target: Element) { this.state.targets.push(target); }
      disconnect() { this.state.disconnected = true; }
    });
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AdminHomepageComponent],
      providers: [provideAppIcons(), { provide: API_URL, useValue: 'http://localhost:3000/' }]
    });
    patchState(unprotected(TestBed.inject(SessionStore)), { username: 'boss', role: 'admin' });
    fixture = TestBed.createComponent(AdminHomepageComponent);
    fixture.detectChanges();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('has a section for everything the admin looks after, each with a heading', () => {
    expect(ADMIN_SECTIONS.map(section => section.id)).toEqual(['overview', 'requests', 'agents', 'airlines', 'configuration', 'inquiries', 'audit']);
    ADMIN_SECTIONS.forEach(section => {
      const element = host().querySelector(`#admin-${section.id}`);
      expect(element).not.toBeNull();
      expect(host().querySelector(`#${section.id}-title`)).not.toBeNull();
    });
    expect(host().querySelector('h1')?.textContent).toBe('Administration');
  });

  it('links to each section from a navigation bar and marks the current one', () => {
    const links = Array.from(host().querySelectorAll<HTMLAnchorElement>('.admin-nav__link'));

    expect(links.map(link => link.textContent?.trim())).toEqual(['Overview', 'Requests', 'Agents', 'Airlines', 'Configuration', 'Inquiries', 'Audit log']);
    expect(links[0].getAttribute('aria-current')).toBe('location');
    expect(links[1].getAttribute('aria-current')).toBeNull();
  });

  it('scrolls to a section and marks it as current when its link is clicked', () => {
    const scrollIntoView = vi.fn();
    (host().querySelector('#admin-agents') as HTMLElement).scrollIntoView = scrollIntoView;
    const link = host().querySelectorAll<HTMLAnchorElement>('.admin-nav__link')[2];

    link.click();
    fixture.detectChanges();

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(link.getAttribute('aria-current')).toBe('location');
  });

  it('does not animate the scroll when motion is reduced', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const scrollIntoView = vi.fn();
    (host().querySelector('#admin-audit') as HTMLElement).scrollIntoView = scrollIntoView;

    host().querySelectorAll<HTMLAnchorElement>('.admin-nav__link')[6].click();

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
  });

  it('follows the reader down the page', () => {
    const spy = observers.find(observer => observer.targets.length === ADMIN_SECTIONS.length) as Observed;
    expect(spy).toBeDefined();

    spy.callback([{ isIntersecting: false, target: host().querySelector('#admin-audit') as Element }]);
    fixture.detectChanges();
    expect(host().querySelector('.admin-nav__link--active')?.textContent?.trim()).toBe('Overview');

    spy.callback([{ isIntersecting: true, target: host().querySelector('#admin-airlines') as Element }]);
    fixture.detectChanges();
    expect(host().querySelector('.admin-nav__link--active')?.textContent?.trim()).toBe('Airlines');
  });

  it('stops watching the page when it goes away', () => {
    const spy = observers.find(observer => observer.targets.length === ADMIN_SECTIONS.length) as Observed;

    fixture.destroy();

    expect(spy.disconnected).toBe(true);
  });
});
