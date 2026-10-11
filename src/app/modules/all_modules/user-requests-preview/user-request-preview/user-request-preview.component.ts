import { Component, OnInit, ChangeDetectionStrategy, inject, Input } from '@angular/core';
import { OrderStore } from 'src/app/services/order/order.store';
import { ConfigService, describePreferences, Order, PreferenceLines } from '@vica-assist/shared';

@Component({
  standalone: false,
  selector: 'userRequest-preview',
  templateUrl: './user-request-preview.component.html',
  styleUrls: ['./user-request-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRequestPreviewComponent implements OnInit {

  protected orderStore = inject(OrderStore);
  private configService = inject(ConfigService);

  myOrder?: Order;
  @Input() orderID = 1;

  get wishes(): PreferenceLines {
    return describePreferences(this.selectedOrder?.preferences, this.configService.config());
  }

  get hasWishes(): boolean {
    const { flight, hotel, needs, notes } = this.wishes;
    return flight.length + hotel.length + needs.length > 0 || notes !== '';
  }

  get selectedOrder(): Order | undefined {
    return this.orderStore.orders()?.find(order => order.id === this.orderID);
  }

  ngOnInit(): void {/* empty*/}
}
