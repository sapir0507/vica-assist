import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, RouterModule } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { SessionStore } from 'src/app/services/session/session.store';
import { LinksComponent } from './links.component';

describe('LinksComponent', () => {
  let fixture: ComponentFixture<LinksComponent>;
  let session: InstanceType<typeof SessionStore>;
  const links = [
    { link: '/homepage', name: 'Homepage' },
    { link: '#', name: 'Logout' }
  ];

  const anchors = () => Array.from<HTMLAnchorElement>(fixture.nativeElement.querySelectorAll('a'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([{ path: 'homepage', children: [] }])],
      declarations: [LinksComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()]
    }).compileComponents();

    session = TestBed.inject(SessionStore);
    fixture = TestBed.createComponent(LinksComponent);
    fixture.componentRef.setInput('currentLinks', links);
  });

  it('renders one anchor per link', () => {
    fixture.detectChanges();

    expect(anchors().map(a => a.textContent?.trim())).toEqual(['Homepage', 'Logout']);
  });

  it('logs the user out and returns to the homepage when Logout is clicked', async () => {
    patchState(unprotected(session), { isLoggedIn: true, role: 'agent', username: 'agent-1' });
    fixture.componentRef.setInput('isLogout', true);
    fixture.detectChanges();

    anchors().find(a => a.textContent?.trim() === 'Logout')?.click();
    await fixture.whenStable();

    expect(session.isLoggedIn()).toBe(false);
    expect(session.role()).toBe('unknown');
    expect(TestBed.inject(Router).url).toBe('/homepage');
  });
});
