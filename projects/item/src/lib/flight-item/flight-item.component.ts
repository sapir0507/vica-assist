import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy, inject } from '@angular/core';
import { checkFlight, ConfigService, Flights, labelOf, Order } from '@vica-assist/shared';

@Component({
  standalone: false,
  selector: 'flight-item',
  templateUrl: './flight-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./flight-item.component.scss']
})
export class FlightItemComponent implements OnInit {
  @Input() label?: string;


  @Input() flight: Flights | null = null;
  @Input() order?: Order | null;
  @Output() chosenFlight: EventEmitter<Flights> = new EventEmitter();

  private static readonly LAST_STEP = 2;

  step = 0;

  private configService = inject(ConfigService);

  constructor() { /* empty */}

  get airlineColor(): string | undefined {
    return this.configService.config().airlines.find(airline => airline.id === this.flight?.airlineId)?.brandColor;
  }

  get cabinLabel(): string {
    return this.flight?.cabin ? labelOf(this.configService.config().cabins, this.flight.cabin) : '';
  }

  get stopsLabel(): string {
    const stops = this.flight?.stops;
    if (stops === '0') return 'Direct';
    if (stops === '1') return '1 stop';
    return /^\d+$/.test(stops ?? '') ? `${stops} stops` : (stops ?? '');
  }

  get baggageIncluded(): boolean {
    return ['true', 'yes'].includes(String(this.flight?.bagage));
  }

  /** What differs from the customer's request; `null` when the customer asked for nothing specific to compare. */
  get differences(): string[] | null {
    if (!this.flight || !this.order) return null;
    return checkFlight(this.order, this.flight, this.configService.config());
  }

  ngOnInit(): void {/* empty */}

  setStep(index: number) {
    this.step = index;
  }

  /** Advances to the next panel, clamped so it never exceeds the last one (otherwise every panel collapses). */
  nextStep() {
    this.step = Math.min(this.step + 1, FlightItemComponent.LAST_STEP);
  }

  /** Moves back to the previous panel, clamped at 0 (otherwise every panel collapses). */
  prevStep() {
    this.step = Math.max(this.step - 1, 0);
  }

  selectFlight(chosenFlight: Flights){
    this.chosenFlight.emit(chosenFlight);
  }

}
