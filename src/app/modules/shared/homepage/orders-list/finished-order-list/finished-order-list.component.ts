import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { finalOrderStore } from 'src/app/services/finalOrder/finalOrder.store';
import { OrderQuery } from 'src/app/services/order/order.query';
import { finalOrder } from 'src/interfaces/final-order.interface';
import { Order } from 'src/interfaces/order.interface';

@Component({
  selector: 'finished-order-list',
  templateUrl: './finished-order-list.component.html',
  styleUrls: ['./finished-order-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinishedOrderListComponent implements OnInit {
  reminder: Subject<boolean> = new Subject();
  step: number = 1;
  @Output() item: EventEmitter<Order> = new EventEmitter();


  // _orders$: Observable<Order[]> = this.orderService.getOrders();
  _orders$: Observable<Order[]> = this.orderQuery.getFinishedOrders$;
 
  constructor( 
    // private orderService: userRequestService,
    private orderQuery: OrderQuery,
    private finalOrderStore: finalOrderStore
    ) {
      this._orders$.pipe(
        takeUntil(this.reminder)
      ).subscribe(data=>console.log(data))
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
    this.item.emit(item)
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.reminder.next(true)
    this.reminder.complete()
  }

}
