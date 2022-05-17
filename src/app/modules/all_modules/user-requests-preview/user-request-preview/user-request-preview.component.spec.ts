import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRequestPreviewComponent } from './user-request-preview.component';

describe('UserRequestPreviewComponent', () => {
  let component: UserRequestPreviewComponent;
  let fixture: ComponentFixture<UserRequestPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserRequestPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRequestPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
