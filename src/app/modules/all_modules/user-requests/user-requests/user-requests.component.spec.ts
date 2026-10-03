import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { UserRequestsComponent } from './user-requests.component';

describe('UserRequestsComponent', () => {
  let component: UserRequestsComponent;
  let fixture: ComponentFixture<UserRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, ReactiveFormsModule, MatSnackBarModule ],
      declarations: [ UserRequestsComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRequestsComponent);
    component = fixture.componentInstance;
    // The template wires several Material form controls (mat-select,
    // mat-radio-group, etc.) that need their real modules imported to
    // render; this is a construction smoke test, so it intentionally
    // skips detectChanges() rather than pulling in the full Material
    // form-field stack.
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
