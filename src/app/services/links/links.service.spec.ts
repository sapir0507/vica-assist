import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LinksService } from './links.service';
import { SessionQuery } from '../session/session.query';
import { SessionStore } from '../session/session.store';

describe('LinksService', () => {
  let service: LinksService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SessionQuery]
    });
    service = TestBed.inject(LinksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns the agent links for an agent', () => {
    const links = service.getLinks('agent');
    expect(links.map(l => l.link)).toEqual(['/add-flight', '/add-hotel']);
  });

  it('returns the customer links for a customer', () => {
    const links = service.getLinks('customer');
    expect(links.map(l => l.link)).toEqual(['/choose-flight', '/choose-hotel']);
  });

  it('includes login/register links for a logged-out shared user', () => {
    const links = service.getLinks('shared');
    expect(links.map(l => l.link)).toEqual(['/homepage', '/login', '/register']);
  });

  it('omits login/register links once logged in', () => {
    const store = TestBed.inject(SessionStore);
    store.update({ isLoggedIn: true });

    const links = service.getLinks('shared');
    expect(links.map(l => l.link)).toEqual(['/homepage']);
  });

  it('falls back to shared links for an unknown role', () => {
    const links = service.getLinks('unknown');
    expect(links.map(l => l.link)).toEqual(['/homepage', '/login', '/register']);
  });
});
