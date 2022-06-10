import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';


@Component({
  selector: 'finished-order',
  templateUrl: './user-finished-order.component.html',
  styleUrls: ['./user-finished-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFinishedOrderComponent implements OnInit {
  constructor(
  ) { }

  ngOnInit(): void {
  }

}
