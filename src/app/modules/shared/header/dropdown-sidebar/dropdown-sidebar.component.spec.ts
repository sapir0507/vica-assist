import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownSidebarComponent } from './dropdown-sidebar.component';

describe('DropdownSidebarComponent', () => {
  let component: DropdownSidebarComponent;
  let fixture: ComponentFixture<DropdownSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DropdownSidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
