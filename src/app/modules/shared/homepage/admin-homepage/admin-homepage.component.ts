import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, inject, signal } from '@angular/core';

import { prefersReducedMotion, RevealDirective } from '../../effects/reveal.directive';
import { AgentsSectionComponent } from './sections/agents-section.component';
import { AirlinesSectionComponent } from './sections/airlines-section.component';
import { AuditSectionComponent } from './sections/audit-section.component';
import { ConfigurationSectionComponent } from './sections/configuration-section.component';
import { InquiriesSectionComponent } from './sections/inquiries-section.component';
import { OverviewSectionComponent } from './sections/overview-section.component';
import { RequestsSectionComponent } from './sections/requests-section.component';

export const ADMIN_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'requests', label: 'Requests' },
  { id: 'agents', label: 'Agents' },
  { id: 'airlines', label: 'Airlines' },
  { id: 'configuration', label: 'Configuration' },
  { id: 'inquiries', label: 'Inquiries' },
  { id: 'audit', label: 'Audit log' }
] as const;

@Component({
  standalone: true,
  selector: 'admin-homepage',
  templateUrl: './admin-homepage.component.html',
  styleUrls: ['./admin-homepage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RevealDirective,
    OverviewSectionComponent,
    RequestsSectionComponent,
    AgentsSectionComponent,
    AirlinesSectionComponent,
    ConfigurationSectionComponent,
    InquiriesSectionComponent,
    AuditSectionComponent
  ]
})
export class AdminHomepageComponent implements AfterViewInit, OnDestroy {
  readonly sections = ADMIN_SECTIONS;
  readonly active = signal<string>(ADMIN_SECTIONS[0].id);

  private host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') return;
    this.observer = new IntersectionObserver(entries => {
      const visible = entries.find(entry => entry.isIntersecting);
      if (visible) this.active.set((visible.target as HTMLElement).id.replace('admin-', ''));
    }, { rootMargin: '-35% 0px -60% 0px' });
    this.host.querySelectorAll('[data-section]').forEach(section => this.observer?.observe(section));
  }

  go(id: string, event: Event): void {
    event.preventDefault();
    this.active.set(id);
    this.host.querySelector(`#admin-${id}`)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
