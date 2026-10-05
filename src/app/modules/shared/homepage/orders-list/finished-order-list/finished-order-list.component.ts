import { Component, OnInit, ChangeDetectionStrategy, inject, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { map, Observable, of, Subject, takeUntil, tap } from 'rxjs';
import { FinalOrderStore } from 'src/app/services/finalOrder/finalOrder.store';
import { OrderQuery } from 'src/app/services/order/order.query';
import { Order } from 'src/interfaces/order.interface';

@Component({
  standalone: false,
  selector: 'finished-order-list',
  templateUrl: './finished-order-list.component.html',
  styleUrls: ['./finished-order-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinishedOrderListComponent implements OnInit {
  private currentOrders: Order[] | null = null;
  @Output() item: EventEmitter<Order> = new EventEmitter();
  _orders$: Observable<Order[] | undefined> = this.orderQuery.getFinishedOrders$

   
  reminder: Subject<boolean> = new Subject();
  step: number = 1;
  private finalOrderStore = inject(FinalOrderStore);

  constructor(
    private orderQuery: OrderQuery,
    private changeDetectionRef: ChangeDetectorRef
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
    this.finalOrderStore.update({ order: item })
    this.item.emit(item)
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.reminder.next(true)
    this.reminder.complete()
  }

}
