import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { API_URL, provideAppIcons } from '@vica-assist/shared';

import { UserRequestsComponent } from 'src/app/modules/all_modules/user-requests/user-requests/user-requests.component';
import { UserHomepageComponent } from './user-homepage.component';

describe('UserHomepageComponent', () => {
  let component: UserHomepageComponent;
  let fixture: ComponentFixture<UserHomepageComponent>;
  const host = () => fixture.nativeElement as HTMLElement;
  const click = (selector: string) => {
    host().querySelector<HTMLElement>(selector)?.click();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UserHomepageComponent],
      providers: [{ provide: API_URL, useValue: 'http://localhost:3000/' }, provideRouter([]), provideAppIcons()]
    }).compileComponents();

    fixture = TestBed.createComponent(UserHomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('offers to book a trip or manage bookings', () => {
    const cards = host().querySelectorAll('.action-card');

    expect(cards).toHaveLength(2);
    expect(cards[0].textContent).toContain('Book your trip');
    expect(cards[1].textContent).toContain('Manage bookings');
  });

  it('opens the booking form and returns to the menu', () => {
    click('.action-card');
    expect(host().querySelector('userRequests')).not.toBeNull();

    click('.back');
    expect(host().querySelector('.action-card')).not.toBeNull();
  });

  it('opens the booking tabs: waiting, ready to choose and booked', () => {
    click('.action-card:nth-child(2)');

    const labels = Array.from(host().querySelectorAll('.mdc-tab__text-label')).map(l => l.textContent?.trim());
    expect(labels).toEqual(['Waiting for agent', 'Ready to choose', 'Booked']);
  });

  it('opens the final order page of a selected order', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    component.selectedItem({ id: 7 } as never);

    expect(navigate).toHaveBeenCalledWith(['final-order', 7]);
  });
});

describe('UserHomepageComponent with a destination chosen before signing in', () => {
  const create = (destination: string | null) => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UserHomepageComponent],
      providers: [
        { provide: API_URL, useValue: 'http://localhost:3000/' },
        provideRouter([]),
        provideAppIcons(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(destination ? { destination } : {}) } } }
      ]
    });
    const fixture = TestBed.createComponent(UserHomepageComponent);
    fixture.detectChanges();
    return fixture;
  };
  const form = (fixture: ComponentFixture<UserHomepageComponent>) =>
    fixture.debugElement.query(By.directive(UserRequestsComponent))?.componentInstance as UserRequestsComponent | undefined;

  it('opens the booking form with that place filled in', () => {
    const fixture = create('lisbon');

    expect(form(fixture)?.requestForm.value.destination).toBe('Lisbon');
  });

  it('opens the usual menu without one, or with something that is not a place', () => {
    expect((create(null).nativeElement as HTMLElement).querySelector('.action-card')).not.toBeNull();

    TestBed.resetTestingModule();
    const fixture = create('https://evil.example');
    expect((fixture.nativeElement as HTMLElement).querySelector('.action-card')).not.toBeNull();
    expect(form(fixture)).toBeUndefined();
  });
});
