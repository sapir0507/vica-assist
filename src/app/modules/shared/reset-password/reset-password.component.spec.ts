import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { environment } from 'src/environments/environment';
import { ResetPasswordComponent } from './reset-password.component';

describe('ResetPasswordComponent', () => {
  let httpMock: HttpTestingController;

  const create = (token: string | null) => {
    TestBed.configureTestingModule({
      imports: [ResetPasswordComponent, MatIconTestingModule],
      providers: [
        provideRouter([]),
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(token ? { token } : {}) } } }
      ]
    });
    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    return fixture;
  };
  const submit = (host: HTMLElement) => (host.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));

  afterEach(() => httpMock.verify());

  it('says the link is not valid when the address has no token', () => {
    const host = create(null).nativeElement as HTMLElement;

    expect(host.querySelector('[role="alert"]')?.textContent).toContain('not valid or has expired');
    expect(host.querySelector('form')).toBeNull();
    expect(host.querySelector('a[href="/forgot-password"]')).not.toBeNull();
  });

  it('does not send anything while the passwords are too short or different', () => {
    const fixture = create('abc');
    const host = fixture.nativeElement as HTMLElement;

    fixture.componentInstance.formGroup.setValue({ password: 'abc', confirm: 'abc' });
    submit(host);
    fixture.componentInstance.formGroup.setValue({ password: 'abcd', confirm: 'abce' });
    submit(host);
    fixture.detectChanges();

    expect(host.querySelector('.form-field__error')?.textContent).toContain('do not match');
    httpMock.expectNone(() => true);
  });

  it('keeps the button disabled until the new password is long enough and repeated correctly', () => {
    const fixture = create('abc');
    const button = () => (fixture.nativeElement as HTMLElement).querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button().disabled).toBe(true);

    fixture.componentInstance.formGroup.setValue({ password: 'abcd', confirm: 'abce' });
    fixture.detectChanges();
    expect(button().disabled).toBe(true);

    fixture.componentInstance.formGroup.setValue({ password: 'abcd', confirm: 'abcd' });
    fixture.detectChanges();
    expect(button().disabled).toBe(false);
  });

  it('changes the password and offers to log in', () => {
    const fixture = create('abc');
    const host = fixture.nativeElement as HTMLElement;
    fixture.componentInstance.formGroup.setValue({ password: 'new-pass', confirm: 'new-pass' });

    submit(host);
    httpMock.expectOne(r => r.url === environment.api + 'passwordResets').flush([{ id: 3, userId: 7, token: 'abc', expiresAt: new Date(Date.now() + 60_000).toISOString() }]);
    httpMock.expectOne(r => r.method === 'PATCH').flush({});
    httpMock.expectOne(r => r.method === 'DELETE').flush({});
    fixture.detectChanges();

    expect(host.querySelector('[role="status"]')?.textContent).toContain('password was changed');
    expect(host.querySelector('a[href="/login"]')).not.toBeNull();
  });

  it('shows the invalid-link message when the token turns out to be used or expired', () => {
    const fixture = create('abc');
    const host = fixture.nativeElement as HTMLElement;
    fixture.componentInstance.formGroup.setValue({ password: 'new-pass', confirm: 'new-pass' });

    submit(host);
    httpMock.expectOne(r => r.url === environment.api + 'passwordResets').flush([]);
    fixture.detectChanges();

    expect(host.querySelector('[role="alert"]')?.textContent).toContain('not valid or has expired');
  });
});
