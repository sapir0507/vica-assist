import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SessionQuery } from 'src/app/services/session/session.query';

import { DropdownSidebarComponent } from './dropdown-sidebar.component';

describe('DropdownSidebarComponent', () => {
  let component: DropdownSidebarComponent;
  let fixture: ComponentFixture<DropdownSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      declarations: [ DropdownSidebarComponent ],
      providers: [ SessionQuery ],
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
});
