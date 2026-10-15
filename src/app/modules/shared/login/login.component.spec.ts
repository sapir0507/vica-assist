import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DestinationStore } from 'src/app/services/destination/destination.store';
import { DESTINATIONS } from 'src/app/modules/shared/destinations/destinations.testing';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { environment } from 'src/environments/environment';
import { SessionStore } from 'src/app/services/session/session.store';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;

  const loginUrl = environment.api + 'login';
  const host = () => fixture.nativeElement as HTMLElement;
  const submit = () => (host().querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule ],
      declarations: [ LoginComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('labels both fields and hints the right autocomplete values', () => {
    const username = host().querySelector('#login-username') as HTMLInputElement;
    const password = host().querySelector('#login-password') as HTMLInputElement;

    expect(host().querySelector('label[for="login-username"]')).not.toBeNull();
    expect(host().querySelector('label[for="login-password"]')).not.toBeNull();
    expect(username.autocomplete).toBe('username');
    expect(password.autocomplete).toBe('current-password');
  });

  it('shows what is missing and sends nothing when the form is empty', () => {
    submit();
    fixture.detectChanges();

    expect(host().textContent).toContain('Enter your username.');
    expect(host().textContent).toContain('Enter your password');
    httpMock.expectNone(r => r.url === loginUrl);
  });

  it('shows an alert after a failed login', () => {
    component.formGroup.setValue({ username: 'user', password: 'wrong-pass', remember: false });

    component.onSubmit();
    httpMock.expectOne(r => r.url === loginUrl).flush([]);
    fixture.detectChanges();

    const alert = host().querySelector('[role="alert"]');
    expect(alert?.textContent).toContain("couldn't log you in");
  });

  it('disables Log in until both fields are valid, and while logging in', () => {
    const button = () => host().querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button().disabled).toBe(true);

    component.formGroup.patchValue({ username: 'user', password: 'abc' });
    fixture.detectChanges();
    expect(button().disabled).toBe(true);

    component.formGroup.patchValue({ password: 'pass' });
    fixture.detectChanges();
    expect(button().disabled).toBe(false);
  });

  it('offers to remember the login and links to the password reset', () => {
    expect(host().querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked).toBe(false);
    expect(host().querySelector('a[href="/forgot-password"]')).not.toBeNull();
  });

  it('keeps the login for later visits only when Remember me is ticked', () => {
    component.formGroup.setValue({ username: 'user', password: 'pass', remember: true });
    component.onSubmit();
    httpMock.expectOne(r => r.url === loginUrl).flush([{ username: 'user', role: 'customer' }]);

    expect(localStorage.getItem('vica-session')).toContain('"username":"user"');
    expect(sessionStorage.getItem('vica-session')).toBeNull();
  });
});

describe('LoginComponent with a destination chosen on the homepage', () => {
  const create = async (destination: string | null) => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule],
      declarations: [LoginComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(destination ? { destination } : {}) } } }]
    }).compileComponents();
    patchState(unprotected(TestBed.inject(DestinationStore)), { destinations: [...DESTINATIONS] });
    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };
  let fixture: ComponentFixture<LoginComponent>;

  it('continues to the booking form after logging in with a chosen place, and to the homepage without one', async () => {
    for (const [destination, target] of [['paris', '/homepage/book'], [null, '/homepage']] as const) {
      TestBed.resetTestingModule();
      await create(destination);
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      TestBed.inject(SessionStore).login = () => of([]) as never;
      patchState(unprotected(TestBed.inject(SessionStore)), { isLoggedIn: true });

      fixture.componentInstance.formGroup.patchValue({ username: 'user', password: 'pass' });
      fixture.componentInstance.onSubmit();

      expect(navigate.mock.calls[0][0]).toEqual([target]);
    }
  });

  it('says which trip the visitor is signing in for', async () => {
    const host = await create('paris');

    expect(host.querySelector('.auth-banner')?.textContent).toContain('Paris');
  });

  it('shows no banner without a destination', async () => {
    expect((await create(null)).querySelector('.auth-banner')).toBeNull();
  });

  it('ignores anything that is not a real place, so the address cannot put words or links on the page', async () => {
    for (const bad of ['Atlantis', 'https://evil.example', '<img src=x onerror=alert(1)>']) {
      TestBed.resetTestingModule();
      const host = await create(bad);
      expect(host.querySelector('.auth-banner')).toBeNull();
      expect(host.innerHTML).not.toContain('evil.example');
    }
  });
});
