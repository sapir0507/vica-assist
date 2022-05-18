import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ItemService } from 'projects/item/src/item';
import { filter, map, Observable, of, Subject, takeUntil } from 'rxjs';
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
   myOrder?: Order;
   private reminder: Subject<boolean> = new Subject();
   @Input() orderid: number = 1;

  constructor(
    private orderService: userRequestService
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
