import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Airline, ConfigInvalidError, ConfigService } from '@vica-assist/shared';

import { AdminService } from 'src/app/services/admin/admin.service';

@Component({
  standalone: true,
  selector: 'admin-airlines',
  templateUrl: './airlines-section.component.html',
  styleUrls: ['./sections.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule]
})
export class AirlinesSectionComponent {
  private configService = inject(ConfigService);
  private admin = inject(AdminService);

  readonly airlines = computed(() => this.configService.config().airlines);
  readonly editing = signal<Airline | null>(null);
  readonly errors = signal<string[]>([]);

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S.*\S/)] }),
    code: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[A-Za-z0-9]{2,3}$/)] }),
    country: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    hub: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    brandColor: new FormControl('#0b3d91', { nonNullable: true }),
    checkedIncludedEconomy: new FormControl(false, { nonNullable: true }),
    weightKg: new FormControl(23, { nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.max(50)] })
  });

  edit(airline: Airline): void {
    this.editing.set(airline);
    this.errors.set([]);
    this.form.setValue({
      name: airline.name,
      code: airline.code,
      country: airline.country,
      hub: airline.hub,
      brandColor: airline.brandColor,
      checkedIncludedEconomy: airline.baggage.checkedIncludedEconomy,
      weightKg: airline.baggage.weightKg
    });
  }

  cancelEdit(): void {
    this.editing.set(null);
    this.errors.set([]);
    this.form.reset({ brandColor: '#0b3d91', weightKg: 23 });
  }

  private apply(airlines: Airline[]): void {
    this.errors.set([]);
    this.admin.saveConfig({ ...this.configService.config(), airlines }).subscribe({
      next: () => this.cancelEdit(),
      error: (error: unknown) => this.errors.set(error instanceof ConfigInvalidError ? error.errors : [(error as Error).message])
    });
  }

  save(): void {
    const value = this.form.getRawValue();
    const fields = {
      name: value.name.trim(),
      code: value.code.trim().toUpperCase(),
      country: value.country.trim(),
      hub: value.hub.trim(),
      brandColor: value.brandColor,
      baggage: { checkedIncludedEconomy: value.checkedIncludedEconomy, weightKg: Number(value.weightKg) }
    };
    const existing = this.editing();
    if (existing) {
      this.apply(this.airlines().map(airline => (airline.id === existing.id ? { ...airline, ...fields } : airline)));
    } else {
      this.apply([...this.airlines(), { ...fields, id: fields.code.toLowerCase(), active: true }]);
    }
  }

  toggleActive(airline: Airline): void {
    this.apply(this.airlines().map(item => (item.id === airline.id ? { ...item, active: !item.active } : item)));
  }
}
