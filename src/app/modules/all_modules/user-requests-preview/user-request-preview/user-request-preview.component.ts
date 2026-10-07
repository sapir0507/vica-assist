import { Component, OnInit, ChangeDetectionStrategy, inject, Input } from '@angular/core';
import { OrderStore } from 'src/app/services/order/order.store';
import { Order } from 'src/interfaces/order.interface';

@Component({
  standalone: false,
  selector: 'userRequest-preview',
  templateUrl: './user-request-preview.component.html',
  styleUrls: ['./user-request-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRequestPreviewComponent implements OnInit {

  protected orderStore = inject(OrderStore);

  myOrder?: Order;
  @Input() orderID = 1;

  ngOnInit(): void {/* empty*/}
}
