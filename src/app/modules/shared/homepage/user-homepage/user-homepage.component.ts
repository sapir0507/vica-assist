import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FinalOrderComponent } from 'src/app/modules/all_modules/final-order/final-order.component';
import { finalOrderStore } from 'src/app/services/finalOrder/finalOrder.store';
import { OrderQuery } from 'src/app/services/order/order.query';
import { Order } from 'src/interfaces/order.interface';

@Component({
  selector: 'user-homepage',
  templateUrl: './user-homepage.component.html',
  styleUrls: ['./user-homepage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserHomepageComponent implements OnInit {

  @Input() status: string = 'Pending';
  
  private tracker: Subject<boolean> = new Subject();
  pendingOrders$:  Observable<Order[] | undefined> =  this.OrderQuery.getPenddingOrders$
  finishedOrders$: Observable<Order[] | undefined> = this.OrderQuery.getFinishedOrders$
  
   
  myRoute: object = {
    path: 'final-order/:id', component: FinalOrderComponent 
  }

  constructor(
    private router: Router,
    private finalOrderStore: finalOrderStore,
    private OrderQuery: OrderQuery
  ) {

    this.pendingOrders$.pipe(
      takeUntil(this.tracker)
    ).subscribe()
    this.finishedOrders$.pipe(
      takeUntil(this.tracker)
    ).subscribe()
          
   }

  ngOnInit(): void {
  }

  onChosen(id: number /* order id */){
    this.router.navigate(['final-order', id])
  }

  onOrder(orderID: string){
    console.log(orderID)
  }

  selectedItem(item: Order){    
    this.finalOrderStore.update(state=>({
      ...state,
      order: item
    }))
    this.onChosen(item.id)
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.tracker.next(true)
    this.tracker.complete()
  }
}
