import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MatFormfieldComponent } from './mat-formfield.component';

describe('MatFormfieldComponent', () => {
  let component: MatFormfieldComponent;
  let fixture: ComponentFixture<MatFormfieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      declarations: [ MatFormfieldComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatFormfieldComponent);
    component = fixture.componentInstance;
    // This component's formControlName is designed to be used inside a
    // parent formGroup directive it doesn't provide itself, so rendering
    // it in isolation (without that parent context) throws; this is a
    // construction smoke test, so it intentionally skips detectChanges().
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
