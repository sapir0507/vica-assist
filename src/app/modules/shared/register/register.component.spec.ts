import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { environment } from 'src/environments/environment';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let httpMock: HttpTestingController;

  const registerUrl = environment.api + 'login';
  const host = () => fixture.nativeElement as HTMLElement;
  const submit = () => (host().querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule ],
      declarations: [ RegisterComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('gives every field its own id and a label bound to it', () => {
    const ids = Array.from(host().querySelectorAll('input[id]')).map(input => input.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ['register-username', 'register-email', 'register-password']) {
      expect(host().querySelector(`label[for="${id}"]`), id).not.toBeNull();
    }
  });

  it('shows what is wrong and sends nothing when the form is incomplete', () => {
    component.formGroup.patchValue({ email: 'not-an-email' });

    submit();
    fixture.detectChanges();

    expect(host().textContent).toContain('Choose a username.');
    expect(host().textContent).toContain('Enter a valid email address.');
    expect(host().textContent).toContain('Use at least 4 characters.');
    httpMock.expectNone(registerUrl);
  });

  it('always registers a customer: there is no way to ask for another role', () => {
    component.formGroup.patchValue({ username: 'new-user', email: 'new@example.com', password: 'pass1234' });

    submit();
    expect(httpMock.expectOne(registerUrl).request.body).toEqual({
      username: 'new-user',
      email: 'new@example.com',
      password: 'pass1234',
      role: 'customer'
    });

    expect(component.formGroup.controls).not.toHaveProperty('role');
    expect(host().querySelector('input[type="radio"]')).toBeNull();
  });
});

describe('RegisterComponent with a destination chosen on the homepage', () => {
  const create = async (destination: string | null) => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule],
      declarations: [RegisterComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(destination ? { destination } : {}) } } }]
    }).compileComponents();
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

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
