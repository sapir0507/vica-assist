import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { Observable, Subject, takeUntil} from 'rxjs';
import { userRequestService } from 'src/app/services/user-request/user-request.service';
import { Order } from 'src/interfaces/order.interface';

@Component({
  selector: 'ordersList',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersListComponent implements OnInit {

  reminder: Subject<boolean> = new Subject();
  _orders$: Observable<Order[]> = this.orderService.getOrders();

  constructor(
    private orderService: userRequestService
  ) { 
    const a = this._orders$.pipe(
      takeUntil(this.reminder)
    ).subscribe()
  }

  ngOnInit(  ): void {
  }
  ngOnDestroy(): void {
    this.reminder.next(true)
    this.reminder.complete()
    
  }

}
