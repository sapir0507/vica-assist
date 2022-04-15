import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewFlightComponent } from './add-new-flight.component';

describe('AddNewFlightComponent', () => {
  let component: AddNewFlightComponent;
  let fixture: ComponentFixture<AddNewFlightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddNewFlightComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewFlightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
