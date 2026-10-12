import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, switchMap, throwError } from 'rxjs';
import {
  Agent,
  AgentProfile,
  ConfigInvalidError,
  ConfigService,
  describeConfigChange,
  finalOrder,
  OrderStatus,
  TRIP_CONFIG_DEFAULTS,
  TripConfig,
  validateAgentProfile
} from '@vica-assist/shared';
import { environment } from 'src/environments/environment';
import { AgentStore } from '../agent/agent.store';
import { AuditStore } from '../audit/audit.store';
import { BookingStore } from '../booking/booking.store';
import { InquiryStore } from '../inquiry/inquiry.store';
import { OrderStore } from '../order/order.store';
import { PublicSummaryStore } from '../public-summary/public-summary.store';
import { SessionStore } from '../session/session.store';

const PASSWORD_CHARS = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** A one-time password the admin hands to a new agent; random, with no look-alike characters. */
export function generateTemporaryPassword(length = 10): string {
  const values = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(values, value => PASSWORD_CHARS[value % PASSWORD_CHARS.length]).join('');
}

/**
 * Everything only the admin may do. Each operation checks the role itself, because hiding a button is not a
 * permission, and writes a line to the audit log. A real backend must repeat these checks.
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private session = inject(SessionStore);
  private configService = inject(ConfigService);
  private agents = inject(AgentStore);
  private orders = inject(OrderStore);
  private bookings = inject(BookingStore);
  private inquiries = inject(InquiryStore);
  private audit = inject(AuditStore);
  private publicSummary = inject(PublicSummaryStore);

  get isAdmin(): boolean {
    return this.session.role() === 'admin';
  }

  private get actor(): string {
    return this.session.username();
  }

  private guarded<T>(work: () => Observable<T>): Observable<T> {
    return this.isAdmin ? work() : throwError(() => new Error('Only the admin can do this.'));
  }

  private logged<T>(action: string, detail: string): (source: Observable<T>) => Observable<T> {
    return source => source.pipe(switchMap(result => this.audit.record(this.actor, action, detail).pipe(map(() => {
      if (/^(config|agent|review)\./.test(action)) this.publicSummary.refresh();
      return result;
    }))));
  }

  saveConfig(config: TripConfig): Observable<TripConfig> {
    return this.guarded(() => {
      const before = this.configService.config();
      return this.configService.save(config, this.actor).pipe(
        map(saved => ({ saved, detail: describeConfigChange(before, saved) })),
        switchMap(({ saved, detail }) => of(saved).pipe(this.logged('config.save', detail)))
      );
    });
  }

  resetConfig(): Observable<TripConfig> {
    return this.guarded(() => this.configService.reset().pipe(this.logged('config.reset', 'went back to the default configuration')));
  }

  importConfig(json: string): Observable<TripConfig> {
    let parsed: TripConfig;
    try {
      parsed = JSON.parse(json) as TripConfig;
    } catch {
      return throwError(() => new Error('This is not valid JSON.'));
    }
    if (!parsed || typeof parsed !== 'object') return throwError(() => new Error('This is not a configuration.'));
    const merged = { ...TRIP_CONFIG_DEFAULTS, ...parsed } as TripConfig;
    return this.saveConfig(merged);
  }

  saveAgent(agent: Agent): Observable<Agent> {
    return this.guarded(() => {
      const errors = validateAgentProfile(agent);
      if (errors.length > 0) return throwError(() => new ConfigInvalidError(errors));
      return this.agents.save(agent).pipe(this.logged('agent.save', `updated agent ${agent.displayName}`));
    });
  }

  setAgentActive(agent: Agent, active: boolean): Observable<Agent> {
    return this.guarded(() => this.agents.save({ ...agent, active, available: active ? agent.available : false })
      .pipe(this.logged('agent.active', `${active ? 'reactivated' : 'deactivated'} agent ${agent.displayName}`)));
  }

  /** Creates the agent's profile and login together, and hands back the one-time password to pass on. */
  createAgent(profile: AgentProfile, password = generateTemporaryPassword()): Observable<{ agent: Agent; password: string }> {
    return this.guarded(() => {
      const errors = validateAgentProfile(profile);
      if (errors.length > 0) return throwError(() => new ConfigInvalidError(errors));

      const params = new HttpParams().append('username', profile.username);
      return this.http.get<unknown[]>(environment.api + 'login', { params }).pipe(
        switchMap(existing => {
          if (existing.length > 0 || this.agents.byUsername(profile.username)) return throwError(() => new Error('That username is taken.'));
          return this.http.post(environment.api + 'login', { active: 1, username: profile.username, password, email: profile.email, role: 'agent' });
        }),
        switchMap(() => this.agents.create({ ...profile, available: true, active: true })),
        this.logged('agent.create', `created agent ${profile.displayName} (${profile.username})`),
        map(agent => ({ agent, password }))
      );
    });
  }

  reassign(orderId: number, to: string): Observable<void> {
    return this.guarded(() => {
      const order = this.orders.orders()?.find(item => item.id === orderId);
      const target = this.agents.byUsername(to);
      if (!order || order.status !== OrderStatus.Pending) return throwError(() => new Error('Only a request that is waiting for an agent can be reassigned.'));
      if (!target || !target.active) return throwError(() => new Error('Choose an active agent.'));
      this.orders.reassign([{ orderId, to, reason: 'manual' }]);
      return this.audit.record(this.actor, 'request.reassign', `moved request ${orderId} from ${order.agent ?? 'nobody'} to ${to}`).pipe(map(() => undefined));
    });
  }

  setReviewHidden(booking: finalOrder, hidden: boolean): Observable<finalOrder> {
    return this.guarded(() => this.bookings.setReviewHidden(booking.id, hidden)
      .pipe(this.logged('review.hide', `${hidden ? 'hid' : 'showed'} the review of booking ${booking.id}`)));
  }

  setInquiryStatus(id: number, status: 'new' | 'read' | 'answered'): Observable<unknown> {
    return this.guarded(() => this.inquiries.setStatus(id, status).pipe(this.logged('inquiry.status', `marked inquiry ${id} as ${status}`)));
  }
}
