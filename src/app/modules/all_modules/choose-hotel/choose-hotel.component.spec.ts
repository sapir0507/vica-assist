import { ComponentFixture, TestBed } from '@angular/core/testing';
import { API_URL } from '@vica-assist/shared';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ChooseHotelComponent } from './choose-hotel.component';

describe('ChooseHotelComponent', () => {
  let component: ChooseHotelComponent;
  let fixture: ComponentFixture<ChooseHotelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: API_URL, useValue: 'http://localhost:3000/' }],
      imports: [ HttpClientTestingModule ],
      declarations: [ ChooseHotelComponent ],
      schemas: [NO_ERRORS_SCHEMA]
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
