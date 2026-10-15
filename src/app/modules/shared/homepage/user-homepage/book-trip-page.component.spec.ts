import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { API_URL, provideAppIcons } from '@vica-assist/shared';

import { UserRequestsComponent } from 'src/app/modules/all_modules/user-requests/user-requests/user-requests.component';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';

import { DESTINATIONS } from '../../destinations/destinations.testing';
import { DestinationStore } from 'src/app/services/destination/destination.store';
import { BookTripPageComponent } from './book-trip-page.component';

describe('BookTripPageComponent', () => {
  const create = (destination: string | null) => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, BookTripPageComponent],
      providers: [
        { provide: API_URL, useValue: 'http://localhost:3000/' },
        provideRouter([]),
        provideAppIcons(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(destination ? { destination } : {}) } } }
      ]
    });
    patchState(unprotected(TestBed.inject(DestinationStore)), { destinations: [...DESTINATIONS] });
    const fixture = TestBed.createComponent(BookTripPageComponent);
    fixture.detectChanges();
    return fixture;
  };
  const form = (fixture: ComponentFixture<BookTripPageComponent>) =>
    fixture.debugElement.query(By.directive(UserRequestsComponent))?.componentInstance as UserRequestsComponent | undefined;

  it('shows the booking form with a way back to the homepage', () => {
    const fixture = create(null);

    expect(form(fixture)).toBeDefined();
    expect((fixture.nativeElement as HTMLElement).querySelector('.back')?.getAttribute('href')).toBe('/homepage');
  });

  it('selects the destination the visitor chose before signing in', () => {
    expect(form(create('tokyo'))?.requestForm.value).toMatchObject({ destinationId: 'tokyo', destination: 'Tokyo' });
  });

  it('ignores anything that is not one of our destinations', () => {
    expect(form(create('https://evil.example'))?.requestForm.value.destinationId).toBeFalsy();
  });
});
