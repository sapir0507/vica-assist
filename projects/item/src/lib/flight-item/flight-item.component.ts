import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Flights } from 'src/app/interfaces/flight.interface';

@Component({
  selector: 'flight-item',
  templateUrl: './flight-item.component.html',
  styleUrls: ['./flight-item.component.scss']
})
export class FlightItemComponent implements OnInit {
  @Input() label?: string;


  @Input() flight: Flights | null = null;
  @Output() chosenFlight: EventEmitter<Flights> = new EventEmitter();

  step = 0;

  constructor() { }

  ngOnInit(): void {
    
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  selectFlight(chosenFlight: Flights){
    this.chosenFlight.emit(chosenFlight);
  }

}
