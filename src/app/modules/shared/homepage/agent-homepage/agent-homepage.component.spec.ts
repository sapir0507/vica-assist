import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentHomepageComponent } from './agent-homepage.component';

describe('AgentHomepageComponent', () => {
  let component: AgentHomepageComponent;
  let fixture: ComponentFixture<AgentHomepageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgentHomepageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentHomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
