import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishedOrderListComponent } from './finished-order-list.component';

describe('FinishedOrderListComponent', () => {
  let component: FinishedOrderListComponent;
  let fixture: ComponentFixture<FinishedOrderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinishedOrderListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinishedOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
