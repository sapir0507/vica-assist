import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { OrderQuery } from 'src/app/services/order/order.query';
import { Order } from 'src/interfaces/order.interface';

@Component({
  selector: 'pending-order-list',
  templateUrl: './pending-order-list.component.html',
  styleUrls: ['./pending-order-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingOrderListComponent implements OnInit {

  reminder: Subject<boolean> = new Subject();
  step: number = 1;
  @Output() item: EventEmitter<Order> = new EventEmitter();

  // _orders$: Observable<Order[]> = this.orderService.getOrders();
  _orders$: Observable<Order[]> = this.orderQuery.getPenddingOrders$;
  constructor(
    private orderQuery: OrderQuery
  ) { }

  ngOnInit(): void {
  }

  nextStep(){
    this.step++;
  }

  previousStep(){
    this.step--;
  }

  selectedItem(item: Order){
    this.item.emit(item)
  }

}
