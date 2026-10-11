import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Agent, AgentProfile, ConfigInvalidError, validateAgentProfile } from '@vica-assist/shared';

import { AdminService } from 'src/app/services/admin/admin.service';
import { AgentStore } from 'src/app/services/agent/agent.store';
import { OrderStore } from 'src/app/services/order/order.store';

const split = (text: string): string[] => text.split(',').map(item => item.trim()).filter(item => item !== '');

@Component({
  standalone: true,
  selector: 'admin-agents',
  templateUrl: './agents-section.component.html',
  styleUrls: ['./sections.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule]
})
export class AgentsSectionComponent {
  private agentStore = inject(AgentStore);
  private orderStore = inject(OrderStore);
  private admin = inject(AdminService);

  readonly agents = computed(() => this.agentStore.agents() ?? []);
  readonly editing = signal<Agent | null>(null);
  readonly errors = signal<string[]>([]);
  readonly created = signal<{ name: string; username: string; password: string } | null>(null);

  readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true }),
    displayName: new FormControl('', { nonNullable: true }),
    title: new FormControl('', { nonNullable: true }),
    bio: new FormControl('', { nonNullable: true }),
    languages: new FormControl('', { nonNullable: true }),
    specialties: new FormControl('', { nonNullable: true }),
    yearsExperience: new FormControl(0, { nonNullable: true }),
    email: new FormControl('', { nonNullable: true })
  });

  constructor() {
    this.agentStore.load();
  }

  openRequests(agent: Agent): number {
    return (this.orderStore.orders() ?? []).filter(order => order.agent === agent.username && order.status === 'pending').length;
  }

  edit(agent: Agent): void {
    this.editing.set(agent);
    this.errors.set([]);
    this.created.set(null);
    this.form.setValue({
      username: agent.username,
      displayName: agent.displayName,
      title: agent.title,
      bio: agent.bio,
      languages: agent.languages.join(', '),
      specialties: agent.specialties.join(', '),
      yearsExperience: agent.yearsExperience,
      email: agent.email
    });
  }

  cancelEdit(): void {
    this.editing.set(null);
    this.errors.set([]);
    this.form.reset({ yearsExperience: 0 });
  }

  private profile(): AgentProfile {
    const value = this.form.getRawValue();
    return {
      username: value.username.trim(),
      displayName: value.displayName.trim(),
      title: value.title.trim(),
      bio: value.bio.trim(),
      languages: split(value.languages),
      specialties: split(value.specialties),
      yearsExperience: Number(value.yearsExperience),
      email: value.email.trim()
    };
  }

  private fail(error: unknown): void {
    this.errors.set(error instanceof ConfigInvalidError ? error.errors : [(error as Error).message]);
  }

  save(): void {
    this.errors.set([]);
    const profile = this.profile();
    const existing = this.editing();

    if (existing) {
      this.admin.saveAgent({ ...existing, ...profile }).subscribe({ next: () => this.cancelEdit(), error: error => this.fail(error) });
      return;
    }
    const problems = validateAgentProfile(profile);
    if (problems.length > 0) {
      this.errors.set(problems);
      return;
    }
    this.admin.createAgent(profile).subscribe({
      next: ({ agent, password }) => {
        this.created.set({ name: agent.displayName, username: agent.username, password });
        this.cancelEdit();
      },
      error: error => this.fail(error)
    });
  }

  toggleActive(agent: Agent): void {
    this.errors.set([]);
    this.admin.setAgentActive(agent, !agent.active).subscribe({ error: error => this.fail(error) });
  }

  dismissPassword(): void {
    this.created.set(null);
  }
}
