import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { environment } from 'src/environments/environment';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      declarations: [ LoginComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows an error message after a failed login', () => {
    const httpMock = TestBed.inject(HttpTestingController);
    component.formGroup.setValue({ username: 'user', password: 'wrong-pass' });

    component.onSubmit();
    httpMock.expectOne(r => r.url === environment.api + 'login').flush([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Username or Password are Invalid');
  });
});
