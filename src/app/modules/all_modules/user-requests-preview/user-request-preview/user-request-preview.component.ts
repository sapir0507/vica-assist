import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { OrderQuery } from 'src/app/services/order/order.query';
import { Order } from 'src/interfaces/order.interface';

@Component({
  selector: 'userRequest-preview',
  templateUrl: './user-request-preview.component.html',
  styleUrls: ['./user-request-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRequestPreviewComponent implements OnInit {

  _allOrders$: Observable<Order[] | undefined> = this.orderQuery.getorders$

  myOrder?: Order;
   private reminder: Subject<boolean> = new Subject();
   @Input() orderID: number = 1;

  constructor(
      private orderQuery: OrderQuery
  ) { 
      
    }

  ngOnInit(): void {
    this._allOrders$
    .pipe(
      takeUntil(this.reminder),
    ).subscribe()
  }


  
  ngOnDestroy(): void {
    this.reminder.next(true)
    this.reminder.complete()
    
  }
}
