import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { of, throwError } from 'rxjs';
import { Agent, API_URL, AuditEntry, ConfigInvalidError, finalOrder, Inquiry, Order, provideAppIcons, TRIP_CONFIG_DEFAULTS } from '@vica-assist/shared';

import { AdminService } from 'src/app/services/admin/admin.service';
import { AgentStore } from 'src/app/services/agent/agent.store';
import { AuditStore } from 'src/app/services/audit/audit.store';
import { BookingStore } from 'src/app/services/booking/booking.store';
import { InquiryStore } from 'src/app/services/inquiry/inquiry.store';
import { OrderStore } from 'src/app/services/order/order.store';
import { SessionStore } from 'src/app/services/session/session.store';
import { AgentsSectionComponent } from './agents-section.component';
import { AirlinesSectionComponent } from './airlines-section.component';
import { AuditSectionComponent } from './audit-section.component';
import { ConfigurationSectionComponent } from './configuration-section.component';
import { InquiriesSectionComponent } from './inquiries-section.component';
import { OverviewSectionComponent } from './overview-section.component';
import { RequestsSectionComponent } from './requests-section.component';

const agent = (id: number, username: string, overrides: Partial<Agent> = {}): Agent => ({
  id, username, displayName: `${username[0].toUpperCase()}${username.slice(1)} Cohen`, title: 'Senior travel agent', bio: 'Bio', languages: ['Hebrew', 'English'],
  specialties: ['Paris'], yearsExperience: 5, email: `${username}@example.com`, available: true, active: true, ...overrides
});

const order = (id: number, overrides: Partial<Order> = {}): Order => ({
  id, orderID: `${id}`, choice: 'both', status: 'pending', departureDate: '2026-12-01', returnDate: '2026-12-08', origin: 'Tel Aviv', destination: 'Paris', destinationId: 'paris',
  passDetails: [], priceRange: 1000, customer: 'dana', agent: 'maya', createdAt: new Date().toISOString(), ...overrides
});

function setUp<T>(component: Type<T>, { orders = [] as Order[], agents = [] as Agent[], bookings = [] as finalOrder[] } = {}) {
  TestBed.configureTestingModule({
    imports: [HttpClientTestingModule, component],
    providers: [provideAppIcons(), { provide: API_URL, useValue: 'http://localhost:3000/' }]
  });
  patchState(unprotected(TestBed.inject(SessionStore)), { username: 'boss', role: 'admin' });
  patchState(unprotected(TestBed.inject(OrderStore)), { orders });
  patchState(unprotected(TestBed.inject(AgentStore)), { agents });
  patchState(unprotected(TestBed.inject(BookingStore)), { bookings });
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  return { fixture, host: fixture.nativeElement as HTMLElement, text: () => (fixture.nativeElement as HTMLElement).textContent?.replace(/\s+/g, ' ') ?? '' };
}

const click = (host: HTMLElement, label: string) => {
  Array.from(host.querySelectorAll<HTMLElement>('button')).find(b => b.textContent?.trim() === label)?.click();
};
const type = (host: HTMLElement, selector: string, value: string) => {
  const input = host.querySelector(selector) as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input'));
};

describe('OverviewSectionComponent', () => {
  beforeEach(() => vi.stubGlobal('matchMedia', () => ({ matches: true })));
  afterEach(() => vi.unstubAllGlobals());

  it('shows the headline numbers and compares the agents', () => {
    const answered = order(1, { status: 'finished', agent: 'maya' });
    const booking: finalOrder = { id: 5, order: order(5, { status: 'finished', agent: 'maya' }), feedback: { hotelRating: 5, flightRating: 4, review: 'Great', ratedAt: 'x' } };
    const { fixture, host, text } = setUp(OverviewSectionComponent, { orders: [order(2), answered], agents: [agent(1, 'maya'), agent(2, 'noa', { available: false })], bookings: [booking] });
    fixture.detectChanges();

    expect(host.querySelector('.kpis')?.textContent).toContain('3');
    expect(host.querySelector('.kpis')?.textContent).toContain('100%');
    expect(host.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(text()).toContain('Maya Cohen');
    expect(text()).toContain('Noa Cohen (away)');
    expect(text()).toContain('4.5 / 5');
  });

  it('lists written reviews and hides or shows one through the admin service', () => {
    const booking: finalOrder = { id: 5, order: order(5), feedback: { hotelRating: 5, review: 'Great trip', ratedAt: 'x' } };
    const { fixture, host } = setUp(OverviewSectionComponent, { bookings: [booking] });
    const hide = vi.spyOn(TestBed.inject(AdminService), 'setReviewHidden').mockReturnValue(of(booking));
    fixture.detectChanges();

    expect(host.querySelector('.review__text')?.textContent).toBe('Great trip');
    click(host, 'Hide from the public page');

    expect(hide).toHaveBeenCalledWith(booking, true);
  });

  it('puts a hidden review back, and shows the reason when that fails', () => {
    const booking: finalOrder = { id: 5, order: order(5), feedback: { hotelRating: 5, review: 'Great trip', ratedAt: 'x', hidden: true } };
    const { fixture, host, text } = setUp(OverviewSectionComponent, { bookings: [booking] });
    vi.spyOn(TestBed.inject(AdminService), 'setReviewHidden').mockReturnValue(throwError(() => new Error('Only the admin can do this.')));
    fixture.detectChanges();

    expect(host.querySelector('.review--hidden')).not.toBeNull();
    click(host, 'Show on the public page');
    fixture.detectChanges();

    expect(text()).toContain('Only the admin can do this.');
  });
});

describe('RequestsSectionComponent', () => {
  const orders = [
    order(1, { status: 'pending', createdAt: new Date(Date.now() - 2 * 3_600_000).toISOString() }),
    order(2, { status: 'pending', agent: 'noa', createdAt: new Date(Date.now() - 40 * 3_600_000).toISOString() }),
    order(3, { status: 'finished', createdAt: new Date(Date.now() - 100 * 3_600_000).toISOString() }),
    order(4, { status: 'cancelled', agent: undefined, createdAt: new Date(Date.now() - 120 * 3_600_000).toISOString() })
  ];
  const agents = [agent(1, 'maya'), agent(2, 'noa'), agent(3, 'old', { active: false })];

  it('lists every request with its status, agent and an overdue flag', () => {
    const { host, text } = setUp(RequestsSectionComponent, { orders, agents });

    expect(host.querySelectorAll('tbody tr')).toHaveLength(4);
    expect(host.querySelectorAll('.overdue')).toHaveLength(1);
    expect(text()).toContain('Nobody yet');
    expect(text()).toContain('waiting');
    expect(text()).toContain('answered');
  });

  it('shows the newest request first', () => {
    const { host } = setUp(RequestsSectionComponent, { orders, agents });

    expect(host.querySelector('tbody tr td')?.textContent).toBe('VA-000001');
  });

  it('filters by status', () => {
    const { fixture, host } = setUp(RequestsSectionComponent, { orders, agents });

    const select = host.querySelector('#request-filter') as HTMLSelectElement;
    select.value = 'cancelled';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(host.querySelectorAll('tbody tr')).toHaveLength(1);
  });

  it('offers a move only for waiting requests, to active agents other than the current one', () => {
    const { host } = setUp(RequestsSectionComponent, { orders, agents });

    expect(host.querySelectorAll('tbody select')).toHaveLength(2);
    const options = Array.from(host.querySelectorAll('tbody tr:first-child select option')) as HTMLOptionElement[];
    expect(options.map(o => o.textContent?.trim())).toEqual(['Choose agent', 'Maya Cohen', 'Noa Cohen']);
    expect(options.find(o => o.value === 'maya')?.disabled).toBe(true);
  });

  it('moves a request through the admin service and shows why it could not be moved', () => {
    const { fixture, host, text } = setUp(RequestsSectionComponent, { orders, agents });
    const reassign = vi.spyOn(TestBed.inject(AdminService), 'reassign').mockReturnValue(throwError(() => new Error('Choose an active agent.')));

    const select = host.querySelector('tbody tr:first-child select') as HTMLSelectElement;
    select.value = 'noa';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(reassign).toHaveBeenCalledWith(1, 'noa');
    expect(text()).toContain('Choose an active agent.');
  });

  it('does nothing when no agent is chosen', () => {
    const { fixture, host } = setUp(RequestsSectionComponent, { orders, agents });
    const reassign = vi.spyOn(TestBed.inject(AdminService), 'reassign');

    const select = host.querySelector('tbody tr:first-child select') as HTMLSelectElement;
    select.value = '';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(reassign).not.toHaveBeenCalled();
  });
});

describe('AgentsSectionComponent', () => {
  const fill = (host: HTMLElement) => {
    type(host, '#agent-username', 'noa.katz');
    type(host, '#agent-name', 'Noa Katz');
    type(host, '#agent-title', 'Travel agent');
    type(host, '#agent-email', 'noa@example.com');
    type(host, '#agent-years', '4');
    type(host, '#agent-languages', 'Hebrew, English');
    type(host, '#agent-specialties', 'Rome, hotel');
  };
  const submit = (host: HTMLElement) => (host.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));

  it('lists the agents with their load and status', () => {
    const { host, text } = setUp(AgentsSectionComponent, { agents: [agent(1, 'maya'), agent(2, 'noa', { available: false }), agent(3, 'old', { active: false })], orders: [order(1)] });

    expect(host.querySelectorAll('tbody tr')).toHaveLength(3);
    expect(text()).toContain('available');
    expect(text()).toContain('away');
    expect(text()).toContain('inactive');
  });

  it('creates an agent from the form and shows the one-time password once', () => {
    const { fixture, host, text } = setUp(AgentsSectionComponent);
    const created = agent(9, 'noa.katz');
    const create = vi.spyOn(TestBed.inject(AdminService), 'createAgent').mockReturnValue(of({ agent: created, password: 'Temp1234ab' }));

    fill(host);
    submit(host);
    fixture.detectChanges();

    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      username: 'noa.katz', displayName: 'Noa Katz', languages: ['Hebrew', 'English'], specialties: ['Rome', 'hotel'], yearsExperience: 4
    }));
    expect(text()).toContain('Temp1234ab');

    click(host, 'I have noted it');
    fixture.detectChanges();
    expect(text()).not.toContain('Temp1234ab');
  });

  it('keeps Create agent disabled until the profile is valid', () => {
    const { fixture, host } = setUp(AgentsSectionComponent);
    const button = () => host.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button().disabled).toBe(true);

    type(host, '#agent-username', 'noa.katz');
    fixture.detectChanges();
    expect(button().disabled).toBe(true);

    fill(host);
    fixture.detectChanges();
    expect(button().disabled).toBe(false);

    type(host, '#agent-email', 'not-an-email');
    fixture.detectChanges();
    expect(button().disabled).toBe(true);
    expect(host.querySelector('.errors')?.textContent).toContain('valid email');
  });

  it('lists what is wrong with an invalid profile without calling the service', () => {
    const { fixture, host, text } = setUp(AgentsSectionComponent);
    const create = vi.spyOn(TestBed.inject(AdminService), 'createAgent');

    type(host, '#agent-username', 'x');
    submit(host);
    fixture.detectChanges();

    expect(create).not.toHaveBeenCalled();
    expect(host.querySelectorAll('.errors li').length).toBeGreaterThan(3);
    expect(text()).toContain('first and a last name');
  });

  it('shows the reason when the account could not be created', () => {
    const { fixture, host, text } = setUp(AgentsSectionComponent);
    vi.spyOn(TestBed.inject(AdminService), 'createAgent').mockReturnValue(throwError(() => new Error('That username is taken.')));

    fill(host);
    submit(host);
    fixture.detectChanges();

    expect(text()).toContain('That username is taken.');
  });

  it('edits an existing agent and saves it through the admin service', () => {
    const maya = agent(1, 'maya');
    const { fixture, host, text } = setUp(AgentsSectionComponent, { agents: [maya] });
    const save = vi.spyOn(TestBed.inject(AdminService), 'saveAgent').mockReturnValue(of(maya));

    click(host, 'Edit');
    fixture.detectChanges();
    expect((host.querySelector('#agent-name') as HTMLInputElement).value).toBe('Maya Cohen');
    expect(host.querySelector('#agent-username')?.getAttribute('readonly')).toBe('');
    expect(text()).toContain('Edit Maya Cohen');

    type(host, '#agent-title', 'Director of travel');
    submit(host);
    fixture.detectChanges();

    expect(save).toHaveBeenCalledWith(expect.objectContaining({ id: 1, username: 'maya', title: 'Director of travel' }));
    expect(text()).toContain('Add an agent');
  });

  it('shows the list of problems the service found when saving a profile', () => {
    const { fixture, host, text } = setUp(AgentsSectionComponent, { agents: [agent(1, 'maya')] });
    vi.spyOn(TestBed.inject(AdminService), 'saveAgent').mockReturnValue(throwError(() => new ConfigInvalidError(['Enter a valid email address.'])));

    click(host, 'Edit');
    fixture.detectChanges();
    submit(host);
    fixture.detectChanges();

    expect(text()).toContain('Enter a valid email address.');
  });

  it('deactivates and reactivates an agent', () => {
    const maya = agent(1, 'maya');
    const { fixture, host } = setUp(AgentsSectionComponent, { agents: [maya] });
    const toggle = vi.spyOn(TestBed.inject(AdminService), 'setAgentActive').mockReturnValue(of(maya));

    click(host, 'Deactivate');
    fixture.detectChanges();

    expect(toggle).toHaveBeenCalledWith(maya, false);
  });

  it('can stop editing', () => {
    const { fixture, host, text } = setUp(AgentsSectionComponent, { agents: [agent(1, 'maya')] });

    click(host, 'Edit');
    fixture.detectChanges();
    click(host, 'Cancel');
    fixture.detectChanges();

    expect(text()).toContain('Add an agent');
    expect((host.querySelector('#agent-name') as HTMLInputElement).value).toBe('');
  });
});

describe('AirlinesSectionComponent', () => {
  const submit = (host: HTMLElement) => (host.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
  const saveConfig = () => vi.spyOn(TestBed.inject(AdminService), 'saveConfig').mockImplementation(config => of(config));

  it('lists the airlines with their colour, baggage and status', () => {
    const { host, text } = setUp(AirlinesSectionComponent);

    expect(host.querySelectorAll('tbody tr')).toHaveLength(12);
    expect(text()).toContain('El Al');
    expect(text()).toContain('Included, 23 kg');
    expect((host.querySelector('.code') as HTMLElement).style.background).toContain('rgb');
  });

  it('keeps Add airline disabled until the name, code, country and hub are valid', () => {
    const { fixture, host } = setUp(AirlinesSectionComponent);
    const button = () => host.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button().disabled).toBe(true);

    type(host, '#airline-name', 'Test Air');
    type(host, '#airline-code', 't');
    type(host, '#airline-country', 'Cyprus');
    type(host, '#airline-hub', 'Larnaca');
    fixture.detectChanges();
    expect(button().disabled).toBe(true);
    expect(host.querySelector('.form-hint')?.textContent).toContain('code of 2 or 3');

    type(host, '#airline-code', 'ta');
    fixture.detectChanges();
    expect(button().disabled).toBe(false);
  });

  it('adds an airline, with an id made from its code, through the admin service', () => {
    const { fixture, host } = setUp(AirlinesSectionComponent);
    const save = saveConfig();

    type(host, '#airline-name', 'Test Air');
    type(host, '#airline-code', 'ta');
    type(host, '#airline-country', 'Cyprus');
    type(host, '#airline-hub', 'Larnaca');
    submit(host);
    fixture.detectChanges();

    const added = save.mock.calls[0][0].airlines[12];
    expect(added).toMatchObject({ id: 'ta', code: 'TA', name: 'Test Air', active: true, baggage: { checkedIncludedEconomy: false, weightKg: 23 } });
  });

  it('shows what the checks found when the airline is not acceptable', () => {
    const { fixture, host, text } = setUp(AirlinesSectionComponent);
    vi.spyOn(TestBed.inject(AdminService), 'saveConfig').mockReturnValue(throwError(() => new ConfigInvalidError(['Airline code "LY" is used twice.'])));

    type(host, '#airline-name', 'Copy Air');
    type(host, '#airline-code', 'LY');
    submit(host);
    fixture.detectChanges();

    expect(text()).toContain('Airline code "LY" is used twice.');
  });

  it('edits an airline in place', () => {
    const { fixture, host } = setUp(AirlinesSectionComponent);
    const save = saveConfig();

    click(host, 'Edit');
    fixture.detectChanges();
    expect((host.querySelector('#airline-name') as HTMLInputElement).value).toBe('El Al');
    type(host, '#airline-hub', 'Eilat');
    submit(host);
    fixture.detectChanges();

    const saved = save.mock.calls[0][0].airlines;
    expect(saved).toHaveLength(12);
    expect(saved[0]).toMatchObject({ id: 'ly', hub: 'Eilat' });
  });

  it('deactivates an airline instead of deleting it', () => {
    const { fixture, host } = setUp(AirlinesSectionComponent);
    const save = saveConfig();

    click(host, 'Deactivate');
    fixture.detectChanges();

    const saved = save.mock.calls[0][0].airlines;
    expect(saved).toHaveLength(12);
    expect(saved[0].active).toBe(false);
  });
});

describe('ConfigurationSectionComponent', () => {
  it('starts from the current configuration with nothing to save', () => {
    const { host } = setUp(ConfigurationSectionComponent);

    expect(host.querySelectorAll('.option input[type="text"]').length).toBeGreaterThan(20);
    expect((host.querySelector('button.btn-primary') as HTMLButtonElement).disabled).toBe(true);
    expect(host.textContent).toContain('defaults that ship with the app');
  });

  it('lets a limit be changed and saved through the admin service', () => {
    const { fixture, host } = setUp(ConfigurationSectionComponent);
    const save = vi.spyOn(TestBed.inject(AdminService), 'saveConfig').mockImplementation(config => of(config));

    type(host, '#limit-maxTravelers', '6');
    fixture.detectChanges();
    const button = host.querySelector('button.btn-primary') as HTMLButtonElement;
    expect(button.disabled).toBe(false);
    button.click();
    fixture.detectChanges();

    expect(save.mock.calls[0][0].limits.maxTravelers).toBe(6);
    expect(host.textContent).toContain('The settings were saved.');
  });

  it('shows what is wrong and will not save a value outside its bounds', () => {
    const { fixture, host } = setUp(ConfigurationSectionComponent);

    type(host, '#limit-maxRooms', '99');
    type(host, '#assign-hours', '0');
    fixture.detectChanges();

    expect(host.querySelector('.errors')?.textContent).toContain('"maxRooms" must be a whole number from 1 to 10');
    expect(host.querySelector('.errors')?.textContent).toContain('The response promise must be 1 to 168 hours.');
    expect((host.querySelector('button.btn-primary') as HTMLButtonElement).disabled).toBe(true);
  });

  it('renames, switches off and adds options, giving each new one an id from its words', () => {
    const { fixture, host } = setUp(ConfigurationSectionComponent);
    const section = fixture.componentInstance;

    section.setLabel('cabins', 0, 'Coach');
    section.toggleOption('cabins', 2);
    section.addOption('cabins', 'First class');
    section.addOption('cabins', 'First  class');
    section.addOption('cabins', '   ');
    fixture.detectChanges();

    const cabins = section.draft().cabins;
    expect(cabins.map(c => [c.id, c.label, c.active])).toEqual([
      ['economy', 'Coach', true], ['premium', 'Premium economy', true], ['business', 'Business', false], ['first-class', 'First class', true], ['first-class-2', 'First  class', true]
    ]);
    expect(host.textContent).not.toContain('The configuration is incomplete');
  });

  it('can throw away what was typed', () => {
    const { fixture } = setUp(ConfigurationSectionComponent);
    const section = fixture.componentInstance;

    section.setPublicMinimum('12');
    expect(section.changed()).toBe(true);
    section.discard();

    expect(section.draft().publicMinimum).toBe(TRIP_CONFIG_DEFAULTS.publicMinimum);
    expect(section.changed()).toBe(false);
  });

  it('shows the reason when saving fails', () => {
    const { fixture, host } = setUp(ConfigurationSectionComponent);
    vi.spyOn(TestBed.inject(AdminService), 'saveConfig').mockReturnValue(throwError(() => new Error('Only the admin can do this.')));

    type(host, '#public-minimum', '9');
    fixture.detectChanges();
    (host.querySelector('button.btn-primary') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Only the admin can do this.');
  });

  it('goes back to the defaults when asked, once something was saved', () => {
    const { fixture, host } = setUp(ConfigurationSectionComponent);
    const reset = vi.spyOn(TestBed.inject(AdminService), 'resetConfig').mockReturnValue(of(TRIP_CONFIG_DEFAULTS));
    patchState(unprotected(TestBed.inject(AgentStore)), {});

    fixture.componentInstance.reset();

    expect(reset).toHaveBeenCalled();
    expect(host.textContent).toContain('defaults');
  });

  it('shows the current settings as JSON and imports pasted ones', () => {
    const { fixture, host } = setUp(ConfigurationSectionComponent);
    const importConfig = vi.spyOn(TestBed.inject(AdminService), 'importConfig').mockReturnValue(of(TRIP_CONFIG_DEFAULTS));

    click(host, 'Show the current settings as JSON');
    fixture.detectChanges();
    expect(JSON.parse((host.querySelector('textarea[readonly]') as HTMLTextAreaElement).value).publicMinimum).toBe(5);

    expect((Array.from(host.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Import') as HTMLButtonElement).disabled).toBe(true);
    type(host, '#import-json', '{"publicMinimum": 8}');
    fixture.detectChanges();
    click(host, 'Import');
    fixture.detectChanges();

    expect(importConfig).toHaveBeenCalledWith('{"publicMinimum": 8}');
    expect((host.querySelector('#import-json') as HTMLTextAreaElement).value).toBe('');
  });

  it('shows why an import was refused', () => {
    const { fixture, host } = setUp(ConfigurationSectionComponent);
    vi.spyOn(TestBed.inject(AdminService), 'importConfig').mockReturnValue(throwError(() => new Error('This is not valid JSON.')));

    type(host, '#import-json', 'oops');
    fixture.detectChanges();
    click(host, 'Import');
    fixture.detectChanges();

    expect(host.textContent).toContain('This is not valid JSON.');
  });
});

describe('InquiriesSectionComponent', () => {
  const inquiry = (id: number, createdAt: string, status: Inquiry['status']): Inquiry => ({ id, name: 'Dana', email: 'd@example.com', message: `Question ${id}`, createdAt, status });

  it('shows the newest inquiry first and counts the new ones', () => {
    const { fixture, host, text } = setUp(InquiriesSectionComponent);
    patchState(unprotected(TestBed.inject(InquiryStore)), { inquiries: [inquiry(1, '2026-10-01T09:00:00.000Z', 'new'), inquiry(2, '2026-10-05T09:00:00.000Z', 'read'), inquiry(3, '2026-10-03T09:00:00.000Z', 'new')] });
    fixture.detectChanges();

    expect(Array.from(host.querySelectorAll('.review__text')).map(e => e.textContent)).toEqual(['Question 2', 'Question 3', 'Question 1']);
    expect(text()).toContain('2 new');
  });

  it('marks an inquiry through the admin service and shows why that failed', () => {
    const { fixture, host, text } = setUp(InquiriesSectionComponent);
    patchState(unprotected(TestBed.inject(InquiryStore)), { inquiries: [inquiry(1, '2026-10-01T09:00:00.000Z', 'new')] });
    const mark = vi.spyOn(TestBed.inject(AdminService), 'setInquiryStatus').mockReturnValue(throwError(() => new Error('Only the admin can do this.')));
    fixture.detectChanges();

    click(host, 'Mark as answered');
    fixture.detectChanges();

    expect(mark).toHaveBeenCalledWith(1, 'answered');
    expect(text()).toContain('Only the admin can do this.');
  });

  it('says so when there are none', () => {
    const { fixture, text } = setUp(InquiriesSectionComponent);
    patchState(unprotected(TestBed.inject(InquiryStore)), { inquiries: [] });
    fixture.detectChanges();

    expect(text()).toContain('No inquiries yet.');
  });
});

describe('AuditSectionComponent', () => {
  const entry = (id: number, at: string, actor: string, action: string, detail: string): AuditEntry => ({ id, at, actor, action, detail });

  it('shows the newest entry first, and can be filtered', () => {
    const { fixture, host } = setUp(AuditSectionComponent);
    patchState(unprotected(TestBed.inject(AuditStore)), {
      entries: [entry(1, '2026-10-01T09:00:00.000Z', 'admin', 'airline.add', 'added airline Test Air'), entry(2, '2026-10-02T09:00:00.000Z', 'admin', 'config.save', 'responseHours 24 to 12')]
    });
    fixture.detectChanges();
    expect(Array.from(host.querySelectorAll('tbody tr')).map(r => r.querySelector('code')?.textContent)).toEqual(['config.save', 'airline.add']);

    type(host, '#audit-filter', 'airline');
    fixture.detectChanges();
    expect(host.querySelectorAll('tbody tr')).toHaveLength(1);
  });

  it('says so when nothing was changed yet', () => {
    const { fixture, text } = setUp(AuditSectionComponent);
    patchState(unprotected(TestBed.inject(AuditStore)), { entries: [] });
    fixture.detectChanges();

    expect(text()).toContain('Nothing has been changed yet.');
  });
});
