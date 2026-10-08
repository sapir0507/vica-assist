import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { Flights } from '@vica-assist/shared';

@Component({
  standalone: false,
  selector: 'flight-item',
  templateUrl: './flight-item.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./flight-item.component.scss']
})
export class FlightItemComponent implements OnInit {
  @Input() label?: string;


  @Input() flight: Flights | null = null;
  @Output() chosenFlight: EventEmitter<Flights> = new EventEmitter();

  private static readonly LAST_STEP = 2;

  step = 0;

  constructor() { /* empty */}

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
