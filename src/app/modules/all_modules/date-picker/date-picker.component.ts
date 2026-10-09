import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {
  
  constructor() { 
    
  }

  ngOnInit(): void {/* empty*/}

}
