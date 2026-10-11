import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { Agent } from '@vica-assist/shared';
import { environment } from 'src/environments/environment';
import { AgentStore } from './agent.store';

const url = environment.api + 'agents';

const agent = (id: number, username: string, overrides: Partial<Agent> = {}): Agent => ({
  id, username, displayName: username, title: '', bio: '', languages: [], specialties: [], yearsExperience: 1, email: '', available: true, active: true, ...overrides
});

describe('AgentStore', () => {
  let store: InstanceType<typeof AgentStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withXhr()), provideHttpClientTesting()] });
    store = TestBed.inject(AgentStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the agents and finds one by username', () => {
    store.load();
    httpMock.expectOne(url).flush([agent(1, 'dana'), agent(2, 'noa', { active: false })]);

    expect(store.agents()).toHaveLength(2);
    expect(store.byUsername('noa')?.id).toBe(2);
    expect(store.byUsername('nobody')).toBeUndefined();
    expect(store.active().map(a => a.username)).toEqual(['dana']);
  });

  it('saves a change of availability and updates the store', () => {
    store.load();
    httpMock.expectOne(url).flush([agent(1, 'dana')]);

    store.setAvailability('dana', false).subscribe();

    const req = httpMock.expectOne(`${url}/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ available: false });
    req.flush(agent(1, 'dana', { available: false }));
    expect(store.byUsername('dana')?.available).toBe(false);
  });

  it('refuses to change an agent that does not exist, without calling the backend', () => {
    store.load();
    httpMock.expectOne(url).flush([agent(1, 'dana')]);
    let message = '';

    store.setAvailability('ghost', true).subscribe({ error: (e: Error) => (message = e.message) });

    expect(message).toBe('This agent does not exist.');
  });

  it('saves a changed profile and updates the store', () => {
    store.load();
    httpMock.expectOne(url).flush([agent(1, 'dana')]);

    store.save({ ...agent(1, 'dana'), title: 'Director' }).subscribe();

    const req = httpMock.expectOne(`${url}/1`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...agent(1, 'dana'), title: 'Director' });
    expect(store.byUsername('dana')?.title).toBe('Director');
  });

  it('adds a new agent to the store', () => {
    store.load();
    httpMock.expectOne(url).flush([agent(1, 'dana')]);
    const { id: _id, ...profile } = agent(2, 'noa');

    store.create(profile).subscribe();

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    req.flush(agent(2, 'noa'));
    expect(store.agents()?.map(a => a.username)).toEqual(['dana', 'noa']);
  });
});
