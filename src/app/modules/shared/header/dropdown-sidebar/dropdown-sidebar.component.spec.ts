import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { DropdownSidebarComponent } from './dropdown-sidebar.component';

describe('DropdownSidebarComponent', () => {
  let component: DropdownSidebarComponent;
  let fixture: ComponentFixture<DropdownSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      declarations: [ DropdownSidebarComponent ],
      schemas: [NO_ERRORS_SCHEMA]
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

  it('lists only the link groups that have links', () => {
    (fixture.nativeElement.querySelector('.menu-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    // customers have no extra links, so only the agents group is rendered
    expect(document.querySelectorAll('app-dropdown')).toHaveLength(1);
  });
});
