import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseHotelComponent } from './choose-hotel.component';

describe('ChooseHotelComponent', () => {
  let component: ChooseHotelComponent;
  let fixture: ComponentFixture<ChooseHotelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChooseHotelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseHotelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
