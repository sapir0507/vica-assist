import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      declarations: [ HeaderComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('swaps between the navbar and the sidebar when the window is resized', () => {
    const resizeTo = (width: number) => {
      const event = new UIEvent('resize');
      Object.defineProperty(event, 'target', { value: { innerWidth: width } });
      window.dispatchEvent(event);
      fixture.detectChanges();
    };
    const host: HTMLElement = fixture.nativeElement;

    resizeTo(400);
    expect(host.querySelector('app-dropdown-sidebar')).not.toBeNull();
    expect(host.querySelector('app-navbar')).toBeNull();

    resizeTo(1400);
    expect(host.querySelector('app-navbar')).not.toBeNull();
    expect(host.querySelector('app-dropdown-sidebar')).toBeNull();
  });
});
