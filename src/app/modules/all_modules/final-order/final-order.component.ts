import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-final-order',
  templateUrl: './final-order.component.html',
  styleUrls: ['./final-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinalOrderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
