import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { provideRouter } from '@angular/router';

import { environment } from 'src/environments/environment';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let httpMock: HttpTestingController;
  const host = () => fixture.nativeElement as HTMLElement;
  const submit = () => (host().querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent, MatIconTestingModule],
      providers: [provideRouter([]), provideHttpClient(withXhr()), provideHttpClientTesting()]
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ForgotPasswordComponent);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('labels the field and asks for a username before sending anything', () => {
    expect(host().querySelector('label[for="forgot-username"]')).not.toBeNull();

    submit();
    fixture.detectChanges();

    expect(host().querySelector('.form-field__error')?.textContent).toContain('Enter your username');
    httpMock.expectNone(() => true);
  });

  it('keeps the button disabled until a username is entered', () => {
    const button = () => host().querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button().disabled).toBe(true);

    fixture.componentInstance.formGroup.setValue({ username: 'sapir' });
    fixture.detectChanges();

    expect(button().disabled).toBe(false);
  });

  it('shows the demo email with a reset link, and says that no email was sent', () => {
    fixture.componentInstance.formGroup.setValue({ username: ' sapir ' });
    submit();
    httpMock.expectOne(r => r.url === environment.api + 'login' && r.params.get('username') === 'sapir').flush([]);
    fixture.detectChanges();

    const link = host().querySelector<HTMLAnchorElement>('.demo-mail a');
    expect(host().querySelector('.demo-mail__label')?.textContent).toContain('no email is sent');
    expect(link?.getAttribute('href')).toMatch(/^\/reset-password\?token=[\w-]+$/);
    expect(host().querySelector('form')).toBeNull();
  });
});
