import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { API_URL, provideAppIcons } from '@vica-assist/shared';

import { BookingsPageComponent } from './bookings-page.component';

describe('BookingsPageComponent', () => {
  let fixture: ComponentFixture<BookingsPageComponent>;
  const host = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, BookingsPageComponent],
      providers: [{ provide: API_URL, useValue: 'http://localhost:3000/' }, provideRouter([]), provideAppIcons()]
    }).compileComponents();
    fixture = TestBed.createComponent(BookingsPageComponent);
    fixture.detectChanges();
  });

  const tabs = () => Array.from(host().querySelectorAll<HTMLButtonElement>('[role="tab"]'));

  it('has the waiting, ready and booked tabs with their counts, and a way back to the homepage', () => {
    expect(tabs().map(tab => tab.textContent?.replace(/\s+/g, ' ').trim())).toEqual(['Waiting for agent 0', 'Ready to choose 0', 'Booked 0']);
    expect(host().querySelector('.back')?.getAttribute('href')).toBe('/homepage');
  });

  it('opens on Ready to choose, and switches tabs', () => {
    expect(tabs().map(tab => tab.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
    expect(host().querySelector('order-status-list')?.getAttribute('status')).toBe('finished');

    tabs()[0].click();
    fixture.detectChanges();

    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
    expect(host().querySelector('order-status-list')?.getAttribute('status')).toBe('pending');
  });

  it('opens the final order page of a selected order', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture.componentInstance.selectedItem({ id: 7 } as never);

    expect(navigate).toHaveBeenCalledWith(['final-order', 7]);
  });
});
