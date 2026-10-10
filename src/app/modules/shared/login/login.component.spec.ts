import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { environment } from 'src/environments/environment';
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

  afterEach(() => httpMock.verify());

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
    component.formGroup.setValue({ username: 'user', password: 'wrong-pass' });

    component.onSubmit();
    httpMock.expectOne(r => r.url === loginUrl).flush([]);
    fixture.detectChanges();

    const alert = host().querySelector('[role="alert"]');
    expect(alert?.textContent).toContain("couldn't log you in");
  });
});
