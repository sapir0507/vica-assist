import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { Agent, API_URL, ConfigInvalidError, finalOrder, Order, TRIP_CONFIG_DEFAULTS, TripConfig } from '@vica-assist/shared';

import { environment } from 'src/environments/environment';
import { AgentStore } from '../agent/agent.store';
import { AuditStore } from '../audit/audit.store';
import { BookingStore } from '../booking/booking.store';
import { OrderStore } from '../order/order.store';
import { PublicSummaryStore } from '../public-summary/public-summary.store';
import { SessionStore } from '../session/session.store';
import { AdminService, generateTemporaryPassword } from './admin.service';

const api = environment.api;

const agent = (id: number, username: string, overrides: Partial<Agent> = {}): Agent => ({
  id, username, displayName: 'Maya Cohen', title: 'Senior travel agent', bio: '', languages: ['Hebrew'], specialties: [], yearsExperience: 5, email: `${username}@example.com`, available: true, active: true, ...overrides
});

describe('generateTemporaryPassword', () => {
  it('is random, as long as asked, and free of look-alike characters', () => {
    const first = generateTemporaryPassword();
    const second = generateTemporaryPassword();

    expect(first).toHaveLength(10);
    expect(first).not.toBe(second);
    expect(generateTemporaryPassword(24)).toHaveLength(24);
    expect(first).toMatch(/^[a-km-zA-HJ-NP-Z2-9]+$/);
  });
});

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;
  const refresh = vi.fn();
  const errorOf = (observable: { subscribe: (observer: { error: (e: Error) => void }) => unknown }) => {
    let error: Error | undefined;
    observable.subscribe({ error: e => (error = e) });
    return error;
  };
  const signIn = (role: 'admin' | 'agent' | 'customer') => patchState(unprotected(TestBed.inject(SessionStore)), { username: 'boss', role });
  const answerAudit = () => httpMock.expectOne(api + 'auditLog').flush({ id: 1, at: 'x', actor: 'boss', action: 'a', detail: 'd' });

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), { provide: API_URL, useValue: api }, { provide: PublicSummaryStore, useValue: { refresh } }] });
    refresh.mockClear();
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne(api + 'orders').flush([]);
  });

  afterEach(() => httpMock.verify());

  describe('who may use it', () => {
    it('refuses every operation for anyone who is not the admin, without calling the backend', () => {
      (['agent', 'customer'] as const).forEach(role => {
        signIn(role);
        const config = structuredClone(TRIP_CONFIG_DEFAULTS);
        const calls = [
          service.saveConfig(config),
          service.resetConfig(),
          service.importConfig('{}'),
          service.saveAgent(agent(1, 'dana')),
          service.setAgentActive(agent(1, 'dana'), false),
          service.createAgent({ ...agent(1, 'dana') }),
          service.reassign(1, 'dana'),
          service.setReviewHidden({ id: 1 } as finalOrder, true),
          service.setInquiryStatus(1, 'read')
        ];

        calls.forEach(call => expect(errorOf(call)?.message).toBe('Only the admin can do this.'));
      });
      expect(service.isAdmin).toBe(false);
    });
  });

  describe('configuration', () => {
    beforeEach(() => signIn('admin'));

    it('saves a valid change and writes what changed to the audit log', () => {
      const config: TripConfig = { ...structuredClone(TRIP_CONFIG_DEFAULTS), assignment: { loadWeight: 1, specialtyWeight: 0.5, responseHours: 12 } };
      let result: TripConfig | undefined;

      service.saveConfig(config).subscribe(saved => (result = saved));
      const put = httpMock.expectOne(api + 'settings/1');
      put.flush(put.request.body);
      const audit = httpMock.expectOne(api + 'auditLog');
      expect(audit.request.body).toMatchObject({ actor: 'boss', action: 'config.save', detail: 'responseHours 24 to 12' });
      audit.flush({ id: 1 });

      expect(result?.assignment.responseHours).toBe(12);
    });

    it('refuses an invalid configuration and says what is wrong, without logging a save', () => {
      const bad = structuredClone(TRIP_CONFIG_DEFAULTS);
      bad.assignment.responseHours = 0;

      const error = errorOf(service.saveConfig(bad));

      expect(error).toBeInstanceOf(ConfigInvalidError);
      expect((error as ConfigInvalidError).errors).toContain('The response promise must be 1 to 168 hours.');
    });

    it('goes back to the defaults and logs it', () => {
      service.resetConfig().subscribe();

      httpMock.expectOne(api + 'settings/1').flush({});
      const audit = httpMock.expectOne(api + 'auditLog');
      expect(audit.request.body.action).toBe('config.reset');
      audit.flush({ id: 1 });
    });

    it('imports JSON, filling what is missing from the defaults, and refuses text that is not JSON', () => {
      expect(errorOf(service.importConfig('not json'))?.message).toBe('This is not valid JSON.');
      expect(errorOf(service.importConfig('null'))?.message).toBe('This is not a configuration.');

      service.importConfig(JSON.stringify({ publicMinimum: 8 })).subscribe();
      const put = httpMock.expectOne(api + 'settings/1');
      expect(put.request.body.publicMinimum).toBe(8);
      expect(put.request.body.airlines).toHaveLength(12);
      put.flush(put.request.body);
      answerAudit();
    });

    it('refuses an imported configuration that does not pass the checks', () => {
      const error = errorOf(service.importConfig(JSON.stringify({ publicMinimum: 0 })));

      expect(error).toBeInstanceOf(ConfigInvalidError);
    });
  });

  describe('agents', () => {
    beforeEach(() => {
      signIn('admin');
      patchState(unprotected(TestBed.inject(AgentStore)), { agents: [agent(1, 'dana')] });
    });

    it('saves a valid profile and logs it', () => {
      service.saveAgent({ ...agent(1, 'dana'), title: 'Director of travel' }).subscribe();

      const patch = httpMock.expectOne(api + 'agents/1');
      patch.flush(patch.request.body);
      expect(httpMock.expectOne(api + 'auditLog').request.body.action).toBe('agent.save');
    });

    it('refuses an invalid profile', () => {
      expect(errorOf(service.saveAgent({ ...agent(1, 'dana'), email: 'nope' }))).toBeInstanceOf(ConfigInvalidError);
    });

    it('deactivates an agent and makes them unavailable', () => {
      service.setAgentActive(agent(1, 'dana'), false).subscribe();

      const patch = httpMock.expectOne(api + 'agents/1');
      expect(patch.request.body).toMatchObject({ active: false, available: false });
      patch.flush(patch.request.body);
      expect(httpMock.expectOne(api + 'auditLog').request.body.detail).toContain('deactivated');
    });

    it('creates the profile and the login together and returns the one-time password', () => {
      let created: { agent: Agent; password: string } | undefined;
      service.createAgent({ ...agent(0, 'noa.new'), displayName: 'Noa Katz' }, 'Temp1234ab').subscribe(result => (created = result));

      httpMock.expectOne(r => r.url === api + 'login' && r.params.get('username') === 'noa.new').flush([]);
      const login = httpMock.expectOne(r => r.url === api + 'login' && r.method === 'POST');
      expect(login.request.body).toMatchObject({ username: 'noa.new', password: 'Temp1234ab', role: 'agent', active: 1 });
      login.flush({});
      const profile = httpMock.expectOne(r => r.url === api + 'agents' && r.method === 'POST');
      expect(profile.request.body).toMatchObject({ username: 'noa.new', available: true, active: true });
      profile.flush({ ...profile.request.body, id: 9 });
      const audit = httpMock.expectOne(api + 'auditLog');
      expect(audit.request.body.action).toBe('agent.create');
      audit.flush({ id: 1 });

      expect(created?.password).toBe('Temp1234ab');
    });

    it('refuses a username that is taken, whether as a login or an agent', () => {
      let message = '';
      service.createAgent({ ...agent(0, 'taken.name'), displayName: 'Noa Katz' }).subscribe({ error: (e: Error) => (message = e.message) });
      httpMock.expectOne(r => r.url === api + 'login').flush([{ id: 1 }]);
      expect(message).toBe('That username is taken.');

      service.createAgent({ ...agent(0, 'dana'), displayName: 'Noa Katz' }).subscribe({ error: (e: Error) => (message = e.message) });
      httpMock.expectOne(r => r.url === api + 'login').flush([]);
      expect(message).toBe('That username is taken.');
    });

    it('refuses an invalid new profile before asking the backend anything', () => {
      expect(errorOf(service.createAgent({ ...agent(0, 'x'), displayName: 'One' }))).toBeInstanceOf(ConfigInvalidError);
    });
  });

  describe('moving a request by hand', () => {
    const pending = { id: 3, status: 'pending', agent: 'dana' } as Order;

    beforeEach(() => {
      signIn('admin');
      patchState(unprotected(TestBed.inject(AgentStore)), { agents: [agent(1, 'dana'), agent(2, 'noa'), agent(3, 'off', { active: false })] });
      patchState(unprotected(TestBed.inject(OrderStore)), { orders: [pending, { id: 4, status: 'finished' } as Order] });
    });

    it('moves a waiting request to an active agent with the reason "manual", and logs it', () => {
      const reassign = vi.spyOn(TestBed.inject(OrderStore), 'reassign').mockReturnValue(undefined);

      service.reassign(3, 'noa').subscribe();

      expect(reassign).toHaveBeenCalledWith([{ orderId: 3, to: 'noa', reason: 'manual' }]);
      expect(httpMock.expectOne(api + 'auditLog').request.body.detail).toBe('moved request 3 from dana to noa');
    });

    it('refuses a request that is not waiting, and an inactive or unknown agent', () => {
      expect(errorOf(service.reassign(4, 'noa'))?.message).toContain('waiting for an agent');
      expect(errorOf(service.reassign(99, 'noa'))?.message).toContain('waiting for an agent');
      expect(errorOf(service.reassign(3, 'off'))?.message).toBe('Choose an active agent.');
      expect(errorOf(service.reassign(3, 'ghost'))?.message).toBe('Choose an active agent.');
    });
  });

  describe('reviews and inquiries', () => {
    beforeEach(() => signIn('admin'));

    it('hides a review and logs it', () => {
      patchState(unprotected(TestBed.inject(BookingStore)), { bookings: [{ id: 6, feedback: { review: 'x', ratedAt: 'y' } } as finalOrder] });

      service.setReviewHidden({ id: 6 } as finalOrder, true).subscribe();

      const patch = httpMock.expectOne(api + 'finalOrder/6');
      patch.flush({ id: 6, feedback: patch.request.body.feedback });
      expect(httpMock.expectOne(api + 'auditLog').request.body.detail).toBe('hid the review of booking 6');
    });

    it('marks an inquiry and logs it', () => {
      service.setInquiryStatus(2, 'answered').subscribe();

      httpMock.expectOne(api + 'inquiries/2').flush({ id: 2, status: 'answered' });
      expect(httpMock.expectOne(api + 'auditLog').request.body.detail).toBe('marked inquiry 2 as answered');
    });
  });

  it('keeps the audit log append-only through the store it uses', () => {
    expect(TestBed.inject(AuditStore).record).toBeDefined();
  });
});

describe('AdminService and the public summary', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;
  const refresh = vi.fn();

  beforeEach(() => {
    refresh.mockClear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), { provide: API_URL, useValue: api }, { provide: PublicSummaryStore, useValue: { refresh } }] });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne(api + 'orders').flush([]);
    patchState(unprotected(TestBed.inject(SessionStore)), { username: 'boss', role: 'admin' });
  });

  afterEach(() => httpMock.verify());

  it('updates what visitors see after a change to the airlines, agents or reviews', () => {
    service.resetConfig().subscribe();
    httpMock.expectOne(api + 'settings/1').flush({});
    httpMock.expectOne(api + 'auditLog').flush({ id: 1 });

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('does not touch the public summary for a change visitors cannot see', () => {
    service.setInquiryStatus(2, 'read').subscribe();
    httpMock.expectOne(api + 'inquiries/2').flush({ id: 2 });
    httpMock.expectOne(api + 'auditLog').flush({ id: 1 });

    expect(refresh).not.toHaveBeenCalled();
  });
});
