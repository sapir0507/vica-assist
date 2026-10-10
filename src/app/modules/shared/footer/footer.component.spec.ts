import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAppIcons } from '@vica-assist/shared';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideAppIcons(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
  });

  it('shows the brand and the current year', () => {
    const text: string = fixture.nativeElement.textContent;

    expect(text).toContain('vica-assist');
    expect(text).toContain(String(new Date().getFullYear()));
  });

  it('says it is a demo, so nobody expects real bookings', () => {
    expect(fixture.nativeElement.textContent).toContain('no real bookings');
  });

  it('links to the public pages from a labelled navigation', () => {
    const nav: HTMLElement = fixture.nativeElement.querySelector('nav[aria-label="Footer"]');
    const links = Array.from(nav.querySelectorAll('a'));

    expect(links.map(a => a.textContent?.trim())).toEqual(['Homepage', 'Login', 'Register']);
    expect(links.map(a => a.getAttribute('href'))).toEqual(['/homepage', '/login', '/register']);
  });
});
