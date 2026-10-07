import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { DropdownComponent } from './dropdown.component';

describe('DropdownComponent', () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NgbDropdownModule ],
      declarations: [ DropdownComponent ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('renders nothing without links', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('shows the links only after the toggle is clicked', () => {
    component.title = 'customers';
    component.currentLinks = [{ name: 'Choose Flight', link: '/choose-flight' }];
    fixture.detectChanges();
    const menu: HTMLElement = fixture.nativeElement.querySelector('.dropdown-menu');

    expect(menu.classList).not.toContain('show');

    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();

    expect(menu.classList).toContain('show');
    expect(fixture.nativeElement.querySelector('app-links')).not.toBeNull();
  });
});
