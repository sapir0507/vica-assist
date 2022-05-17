import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { userRequestService } from 'src/app/services/user-request/user-request.service';
import { Order } from 'src/interfaces/order.interface';

@Component({
  selector: 'userRequest-preview',
  templateUrl: './user-request-preview.component.html',
  styleUrls: ['./user-request-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRequestPreviewComponent implements OnInit {

   _allOrders$: Observable<Order[]> = this.orderService.getOrders();
   reminder: Subject<boolean> = new Subject();
   @Input() order?: Order;
 

  constructor(
    private orderService: userRequestService
  ) { 
    console.log("order", this.order)
    this._allOrders$.pipe(
      takeUntil(this.reminder),
    ).subscribe()
  }

  ngOnInit(): void {
  }

  getOrderId(){
    
  }
  ngOnDestroy(): void {
    this.reminder.next(true)
    this.reminder.complete()
    
  }
}
