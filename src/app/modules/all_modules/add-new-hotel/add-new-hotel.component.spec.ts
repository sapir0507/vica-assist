import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewHotelComponent } from './add-new-hotel.component';

describe('AddNewHotelComponent', () => {
  let component: AddNewHotelComponent;
  let fixture: ComponentFixture<AddNewHotelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddNewHotelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewHotelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
