import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericHomepageComponent } from './generic-homepage.component';

describe('GenericHomepageComponent', () => {
  let component: GenericHomepageComponent;
  let fixture: ComponentFixture<GenericHomepageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericHomepageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericHomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
