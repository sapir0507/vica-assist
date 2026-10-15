import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { API_URL } from '@vica-assist/shared';

import { SessionStore, UserRole } from 'src/app/services/session/session.store';
import { HOMEPAGE_ROUTES } from './homepage.routes';

describe('HOMEPAGE_ROUTES', () => {
  const goTo = async (url: string, role: UserRole) => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: API_URL, useValue: 'http://localhost:3000/' },
        provideRouter([{ path: 'homepage', children: HOMEPAGE_ROUTES }, { path: 'login', children: [] }])
      ]
    });
    patchState(unprotected(TestBed.inject(SessionStore)), { role, isLoggedIn: role !== 'unknown', username: 'dana' });
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    return router.url;
  };

  it('opens the booking pages for a customer', async () => {
    expect(await goTo('/homepage/book?destination=Paris', 'customer')).toBe('/homepage/book?destination=Paris');
    TestBed.resetTestingModule();
    expect(await goTo('/homepage/bookings', 'customer')).toBe('/homepage/bookings');
    TestBed.resetTestingModule();
    expect(await goTo('/homepage/messages?agent=maya', 'customer')).toBe('/homepage/messages?agent=maya');
  });

  it('sends other roles and visitors who open a customer page back to their own homepage', async () => {
    for (const role of ['agent', 'admin', 'unknown'] as const) {
      TestBed.resetTestingModule();
      expect(await goTo('/homepage/book', role)).toBe('/homepage');
    }
  });
});
