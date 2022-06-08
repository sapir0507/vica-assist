import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { Observable, Subject, takeUntil} from 'rxjs';
import { OrderQuery } from 'src/app/services/order/order.query';
import { Order } from 'src/interfaces/order.interface';

@Component({
  selector: 'ordersList',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersListComponent implements OnInit {

  @Output() chosen: EventEmitter<number> = new EventEmitter();
  @Output() orderID: EventEmitter<string> = new EventEmitter();
  @Output() item: EventEmitter<Order> = new EventEmitter();
  @Output() maxIDs: EventEmitter<number> = new EventEmitter();

  @Input() requestID: number = 1;
  @Input() status?: string = 'agent';


  reminder: Subject<boolean> = new Subject();
  _orders$: Observable<Order[] | undefined> = this.orderQuery.getorders$;

  constructor(
    private orderQuery: OrderQuery
  ) { 
    this._orders$.pipe(
      takeUntil(this.reminder)
    ).subscribe(item=>{
      this.maxIDs.emit(item?.length);
    })
  }

  ngOnInit(): void {
  }

  toggleButton(item: Order){
    // status === 'finished' && customer => show Button
    // status === 'pending' && agent => show button
    if((item.status === 'finished' && !this.isAgent()) || (item.status === 'pending' && this.isAgent())) return true;
    else return false;
  }

  isAgent(){
    if(this.status ==='agent') return true;
    return false;
  }

  openOrder(item: Order){
    this.item.emit(item)
  }
  
  ngOnDestroy(): void {
    this.reminder.next(true);
    this.reminder.complete();
    
  }
 
}
