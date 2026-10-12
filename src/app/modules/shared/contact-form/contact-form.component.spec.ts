import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { API_URL } from '@vica-assist/shared';

import { environment } from 'src/environments/environment';
import { ContactFormComponent } from './contact-form.component';

const url = environment.api + 'inquiries';

describe('ContactFormComponent', () => {
  let fixture: ComponentFixture<ContactFormComponent>;
  let httpMock: HttpTestingController;
  const host = () => fixture.nativeElement as HTMLElement;
  const text = () => host().textContent?.replace(/\s+/g, ' ') ?? '';
  const type = (selector: string, value: string) => {
    const input = host().querySelector(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
  };
  const submit = () => {
    (host().querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };
  const fill = () => {
    type('#contact-name', '  Dana   Levi ');
    type('#contact-email', ' dana@example.com ');
    type('#contact-message', '  Do you arrange trips for ten people?  ');
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ContactFormComponent],
      providers: [{ provide: API_URL, useValue: 'http://localhost:3000/' }]
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ContactFormComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    vi.unstubAllGlobals();
  });

  it('is a question form: no trip details and no quote', () => {
    expect(Array.from(host().querySelectorAll('label')).map(l => l.textContent?.trim())).toEqual(['Your name', 'Email', 'Your question', 'Leave this empty']);
  });

  it('sends a trimmed question as a new inquiry and thanks the visitor', () => {
    fill();
    submit();

    const req = httpMock.expectOne(url);
    expect(req.request.body).toMatchObject({ name: 'Dana Levi', email: 'dana@example.com', message: 'Do you arrange trips for ten people?', status: 'new' });
    req.flush({ id: 1 });
    fixture.detectChanges();

    expect(text()).toContain('Thank you, your message is on its way');
    expect(text()).toContain('within 24 hours');
    expect(host().querySelector('form')).toBeNull();
  });

  it('can be used again after the thanks', () => {
    fill();
    submit();
    httpMock.expectOne(url).flush({ id: 1 });
    fixture.detectChanges();

    (Array.from(host().querySelectorAll('button')).find(b => b.textContent?.includes('Write another')) as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(host().querySelector('form')).not.toBeNull();
    expect((host().querySelector('#contact-name') as HTMLInputElement).value).toBe('');
  });

  it('asks for what is missing and sends nothing', () => {
    submit();

    expect(text()).toContain('Enter your name, using letters only.');
    expect(text()).toContain('Enter a valid email address.');
    expect(text()).toContain('Write at least 10 characters.');
    httpMock.expectNone(url);
  });

  it('refuses a name with digits or symbols', () => {
    fill();
    ['Dana 2', 'Dana<script>', '@', 'D'].forEach(bad => {
      type('#contact-name', bad);
      expect(fixture.componentInstance.form.controls.name.hasError('name')).toBe(true);
    });
    ['Dana', "Mary-Jane O'Neil", 'José Ñúñez', 'דנה'].forEach(good => {
      type('#contact-name', good);
      expect(fixture.componentInstance.form.controls.name.valid).toBe(true);
    });
  });

  it('refuses addresses that are not emails or are too long', () => {
    ['dana', 'dana@', 'dana@example', 'a b@example.com', `${'a'.repeat(250)}@example.com`].forEach(bad => {
      type('#contact-email', bad);
      expect(fixture.componentInstance.form.controls.email.hasError('email')).toBe(true);
    });
    type('#contact-email', 'dana@example.com');
    expect(fixture.componentInstance.form.controls.email.valid).toBe(true);
  });

  it('wants a question of 10 to 1000 characters, not counting surrounding spaces', () => {
    fill();
    type('#contact-message', '   too short ');
    expect(fixture.componentInstance.form.controls.message.hasError('tooShort')).toBe(true);

    type('#contact-message', 'a'.repeat(1001));
    expect(fixture.componentInstance.form.controls.message.hasError('tooLong')).toBe(true);
    fixture.detectChanges();
    expect(text()).toContain('1001 / 1000');
    expect(text()).toContain('Keep your question to 1000 characters or fewer.');

    type('#contact-message', ` ${'a'.repeat(1000)} `);
    expect(fixture.componentInstance.form.controls.message.valid).toBe(true);
  });

  it('quietly drops a submission where the hidden trap field was filled in, as a robot would', () => {
    fill();
    type('#contact-website', 'http://spam.example');
    submit();

    httpMock.expectNone(url);
    expect(text()).toContain('Thank you');
  });

  it('makes a visitor wait a minute between questions', () => {
    fill();
    submit();
    httpMock.expectOne(url).flush({ id: 1 });
    fixture.detectChanges();
    (Array.from(host().querySelectorAll('button')).find(b => b.textContent?.includes('Write another')) as HTMLButtonElement).click();
    fixture.detectChanges();

    fill();
    submit();

    httpMock.expectNone(url);
    expect(text()).toMatch(/Please wait \d+ seconds before sending another message\./);
  });

  it('allows another question once the minute has passed', () => {
    localStorage.setItem('vica-last-inquiry', String(Date.now() - 61_000));
    fill();
    submit();

    httpMock.expectOne(url).flush({ id: 1 });
  });

  it('still works when the browser will not let the page store anything', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } });
    fill();
    submit();

    httpMock.expectOne(url).flush({ id: 1 });
    fixture.detectChanges();
    expect(text()).toContain('Thank you');
  });

  it('keeps what was typed and says so when sending fails', () => {
    fill();
    submit();
    httpMock.expectOne(url).flush('down', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(text()).toContain('We could not send your message.');
    expect((host().querySelector('#contact-name') as HTMLInputElement).value).toBe('  Dana   Levi ');
    expect((host().querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(false);
  });

  it('hides the trap field from people and from screen readers', () => {
    const trap = host().querySelector('.contact__trap') as HTMLElement;

    expect(trap.getAttribute('aria-hidden')).toBe('true');
    expect((host().querySelector('#contact-website') as HTMLInputElement).tabIndex).toBe(-1);
  });
});
