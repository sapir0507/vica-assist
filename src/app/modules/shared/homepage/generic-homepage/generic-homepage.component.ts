import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfigService } from '@vica-assist/shared';

import { PublicSummaryStore } from 'src/app/services/public-summary/public-summary.store';
import { ContactFormComponent } from '../../contact-form/contact-form.component';
import { DestinationCardComponent } from '../../destinations/destination-card/destination-card.component';
import { DestinationPanelComponent } from '../../destinations/destination-panel/destination-panel.component';
import { Destination, trendingDestinations } from '../../destinations/destinations';
import { CountUpDirective } from '../../effects/count-up.directive';
import { RevealDirective } from '../../effects/reveal.directive';
import { StarRatingComponent } from '../../rating/star-rating.component';

@Component({
  standalone: true,
  selector: 'generic-homepage',
  templateUrl: './generic-homepage.component.html',
  styleUrls: ['./generic-homepage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    ContactFormComponent,
    DestinationCardComponent,
    DestinationPanelComponent,
    CountUpDirective,
    RevealDirective,
    StarRatingComponent
  ]
})
export class GenericHomepageComponent {
  private store = inject(PublicSummaryStore);
  private config = inject(ConfigService);

  readonly summary = this.store.summary;
  readonly destinations = computed(() => trendingDestinations(this.summary()));
  readonly chosen = signal<Destination | null>(null);
  readonly reviews = computed(() => (this.summary()?.reviews ?? []).slice(0, 6));
  readonly hours = computed(() => this.config.config().assignment.responseHours);

  readonly steps = computed(() => [
    { title: 'Tell us about your trip', text: 'Describe where and when you want to go, who travels, and what matters to you: direct flights, a checked bag, breakfast.' },
    { title: 'Meet your agent', text: `An agent is assigned to your request and answers, usually within ${this.hours()} hours.` },
    { title: 'Compare the options', text: 'Your agent adds flights and hotels, and you see how each one fits what you asked for.' },
    { title: 'Choose and travel', text: 'Pick what you like, your agent completes the arrangements, and you can rate the trip afterwards.' }
  ]);

  readonly faq = computed(() => [
    { question: 'How fast will I hear back?', answer: `Agents answer within ${this.hours()} hours. If a request waits longer, it is passed to another agent and you are told.` },
    { question: 'Can I change or cancel a request?', answer: 'Yes, as long as it is still waiting for its agent. Once options have been added you choose among them instead.' },
    { question: 'How is my agent chosen?', answer: 'The agent with the least on their desk, with a head start for someone who knows your destination well.' },
    { question: 'Is a checked bag included?', answer: 'It depends on the airline and the fare. You can ask for one in your preferences, and every offer says whether it is included.' },
    { question: `Which airlines do you work with?`, answer: (this.summary()?.airlines ?? []).length ? (this.summary()?.airlines ?? []).join(', ') + '.' : 'A list of carriers that the team keeps up to date.' },
    { question: 'What happens to my details?', answer: 'They are used to arrange your trip. This page only ever shows totals, first names and destinations, never anyone\'s ID, email or budget.' }
  ]);

  readonly trustPoints = [
    { icon: 'badge', title: 'Real agents', text: 'A travel agent reads every request and handpicks the options.' },
    { icon: 'sell', title: 'Your budget', text: 'Customers set the most they want to spend and agents stay within it.' },
    { icon: 'free_cancellation', title: 'All in one place', text: 'Follow a request from first message to confirmed flights and hotel.' }
  ];

  constructor() {
    this.store.load();
  }

  initials(name: string): string {
    return name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase();
  }

  rounded(rating: number): number {
    return Math.round(rating);
  }

  open(destination: Destination): void {
    this.chosen.set(destination);
  }

  forget(): void {
    this.chosen.set(null);
  }
}
