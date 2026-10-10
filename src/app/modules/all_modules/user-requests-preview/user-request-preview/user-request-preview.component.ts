import { Component, OnInit, ChangeDetectionStrategy, inject, Input } from '@angular/core';
import { OrderStore } from 'src/app/services/order/order.store';
import { Order } from '@vica-assist/shared';

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

  get selectedOrder(): Order | undefined {
    return this.orderStore.orders()?.find(order => order.id === this.orderID);
  }

  ngOnInit(): void {/* empty*/}
}
