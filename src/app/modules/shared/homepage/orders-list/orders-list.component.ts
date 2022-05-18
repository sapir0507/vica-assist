import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
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

  @Output() chosen: EventEmitter<number> = new EventEmitter();
  @Output() maxIDs: EventEmitter<number> = new EventEmitter();

  @Input() requestID: number = 1;

  reminder: Subject<boolean> = new Subject();
  _orders$: Observable<Order[]> = this.orderService.getOrders();

  constructor(
    private orderService: userRequestService
  ) { 
    this._orders$.pipe(
      takeUntil(this.reminder)
    ).subscribe(item=>{
      this.maxIDs.emit(item.length);
    })
  }

  ngOnInit(): void {
  }

  openOrder(id: number){
     this.chosen.emit(id);
  }
  
  ngOnDestroy(): void {
    this.reminder.next(true);
    this.reminder.complete();
    
  }
 
}
