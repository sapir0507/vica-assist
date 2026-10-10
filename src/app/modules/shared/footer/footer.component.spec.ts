import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAppIcons } from '@vica-assist/shared';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideAppIcons()]
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
});
