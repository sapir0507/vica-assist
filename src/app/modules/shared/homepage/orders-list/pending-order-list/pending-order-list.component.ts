import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { finalOrderStore } from 'src/app/services/finalOrder/finalOrder.store';
import { OrderQuery } from 'src/app/services/order/order.query';
import { Order } from 'src/interfaces/order.interface';

@Component({
  selector: 'pending-order-list',
  templateUrl: './pending-order-list.component.html',
  styleUrls: ['./pending-order-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingOrderListComponent implements OnInit {
  private currentOrders: Order[] | null = null;
  reminder: Subject<boolean> = new Subject();
  step: number = 1;
  @Output() item: EventEmitter<Order> = new EventEmitter();

  _orders$: Observable<Order[] | undefined> = this.orderQuery.getPenddingOrders$;
  constructor(
    private orderQuery: OrderQuery,
    private finalOrderStore: finalOrderStore
  ) { 
    this._orders$.pipe(
      takeUntil(this.reminder)
      
    ).subscribe()
  }

  ngOnInit(): void {
  }

  nextStep(){
    this.step++;
  }

  previousStep(){
    this.step--;
  }

  selectedItem(item: Order){
    this.finalOrderStore.update(state=>({
      ...state,
      order: item
    }))
    this.item.emit(item);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.reminder.next(true);
    this.reminder.complete();
  }

}
