import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseFlightComponent } from './choose-flight.component';

describe('ChooseFlightComponent', () => {
  let component: ChooseFlightComponent;
  let fixture: ComponentFixture<ChooseFlightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChooseFlightComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseFlightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
