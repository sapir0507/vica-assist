import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { ConfigInvalidError, ConfigService, OptionListName, TripConfig, validateConfig } from '@vica-assist/shared';

import { AdminService } from 'src/app/services/admin/admin.service';

export const LIST_TITLES: Record<OptionListName, string> = {
  cabins: 'Cabin classes',
  stopsOptions: 'Stops',
  departureTimes: 'Times of day',
  bedTypes: 'Bed types',
  hotelAreas: 'Hotel areas',
  meals: 'Meals',
  seatTypes: 'Seats'
};

const LIMIT_TITLES: Record<keyof TripConfig['limits'], string> = {
  maxTravelers: 'Most travelers in a request',
  maxRooms: 'Most rooms',
  maxStops: 'Most stops',
  maxLayoverHours: 'Longest layover (hours)',
  maxFlexibleDays: 'Most flexible days',
  nameMaxLength: 'Longest name',
  notesMaxLength: 'Longest note',
  messageMaxLength: 'Longest message'
};

const slug = (label: string): string => label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';

@Component({
  standalone: true,
  selector: 'admin-configuration',
  templateUrl: './configuration-section.component.html',
  styleUrls: ['./sections.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurationSectionComponent {
  private configService = inject(ConfigService);
  private admin = inject(AdminService);

  readonly lists = Object.entries(LIST_TITLES).map(([name, title]) => ({ name: name as OptionListName, title }));
  readonly limitKeys = Object.keys(LIMIT_TITLES) as (keyof TripConfig['limits'])[];
  readonly limitTitle = (key: keyof TripConfig['limits']) => LIMIT_TITLES[key];

  readonly draft = signal<TripConfig>(structuredClone(this.configService.config()));
  readonly saved = signal(false);
  readonly serverErrors = signal<string[]>([]);
  readonly exportText = signal<string | null>(null);
  readonly importText = signal('');

  readonly problems = computed(() => {
    try {
      return validateConfig(this.draft());
    } catch {
      return ['The configuration is incomplete.'];
    }
  });
  readonly changed = computed(() => JSON.stringify(this.draft()) !== JSON.stringify(this.configService.config()));
  readonly customised = this.configService.isCustomised;

  constructor() {
    effect(() => {
      const current = this.configService.config();
      untracked(() => this.draft.set(structuredClone(current)));
    });
  }

  private update(change: (draft: TripConfig) => void): void {
    const next = structuredClone(this.draft());
    change(next);
    this.saved.set(false);
    this.draft.set(next);
  }

  setLabel(list: OptionListName, index: number, label: string): void {
    this.update(draft => (draft[list][index].label = label));
  }

  toggleOption(list: OptionListName, index: number): void {
    this.update(draft => (draft[list][index].active = !draft[list][index].active));
  }

  addOption(list: OptionListName, label: string): void {
    const text = label.trim();
    if (!text) return;
    this.update(draft => {
      let id = slug(text);
      while (draft[list].some(option => option.id === id)) id += '-2';
      draft[list].push({ id, label: text, active: true });
    });
  }

  setLimit(key: keyof TripConfig['limits'], value: string): void {
    this.update(draft => (draft.limits[key] = Number(value)));
  }

  setAssignment(key: keyof TripConfig['assignment'], value: string): void {
    this.update(draft => (draft.assignment[key] = Number(value)));
  }

  setPublicMinimum(value: string): void {
    this.update(draft => (draft.publicMinimum = Number(value)));
  }

  private fail(error: unknown): void {
    this.serverErrors.set(error instanceof ConfigInvalidError ? error.errors : [(error as Error).message]);
  }

  save(): void {
    this.serverErrors.set([]);
    this.admin.saveConfig(this.draft()).subscribe({ next: () => this.saved.set(true), error: error => this.fail(error) });
  }

  discard(): void {
    this.draft.set(structuredClone(this.configService.config()));
    this.serverErrors.set([]);
  }

  reset(): void {
    this.serverErrors.set([]);
    this.admin.resetConfig().subscribe({ next: () => this.saved.set(true), error: error => this.fail(error) });
  }

  showExport(): void {
    this.exportText.set(JSON.stringify(this.configService.config(), null, 2));
  }

  importJson(): void {
    this.serverErrors.set([]);
    this.admin.importConfig(this.importText()).subscribe({
      next: () => {
        this.saved.set(true);
        this.importText.set('');
      },
      error: error => this.fail(error)
    });
  }
}
