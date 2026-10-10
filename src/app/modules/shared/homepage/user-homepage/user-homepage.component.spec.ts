import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { API_URL, provideAppIcons } from '@vica-assist/shared';

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

  it('opens the order lists', () => {
    click('.action-card:nth-child(2)');

    expect(host().querySelector('mat-tab-group')).not.toBeNull();
  });

  it('opens the final order page of a selected order', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    component.selectedItem({ id: 7 } as never);

    expect(navigate).toHaveBeenCalledWith(['final-order', 7]);
  });
});
