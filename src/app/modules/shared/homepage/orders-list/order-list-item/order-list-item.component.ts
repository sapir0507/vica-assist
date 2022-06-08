import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { finalOrderStore } from 'src/app/services/finalOrder/finalOrder.store';
import { Order } from 'src/interfaces/order.interface';

@Component({
  selector: 'order-list-item',
  templateUrl: './order-list-item.component.html',
  styleUrls: ['./order-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderListItemComponent implements OnInit {

  @Input() currentItem: Order | null = null;
  @Output() item: EventEmitter<Order> = new EventEmitter();

  constructor(
    private finalOrderStore: finalOrderStore
  ) { }

  ngOnInit(): void {
  }

  openOrder(item: Order){
    this.item.emit(item)
  }
}
