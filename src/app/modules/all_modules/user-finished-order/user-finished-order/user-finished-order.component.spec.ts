import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { UserFinishedOrderComponent } from './user-finished-order.component';

describe('UserFinishedOrderComponent', () => {
  let component: UserFinishedOrderComponent;
  let fixture: ComponentFixture<UserFinishedOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserFinishedOrderComponent ],
      imports: [RouterModule.forRoot([])]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserFinishedOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
