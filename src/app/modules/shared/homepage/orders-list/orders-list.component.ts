import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MyPipesModule } from '@vica-assist/my-pipes';
import { OrderStore } from 'src/app/services/order/order.store';
import { isFinished, isPending, Order, requestNumber } from '@vica-assist/shared';

@Component({
  standalone: true,
  selector: 'ordersList',
  templateUrl: './orders-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
     DatePipe,
     MyPipesModule,
     MatButtonModule,
     MatIconModule,
  ]
})
export class OrdersListComponent implements OnInit {
  protected readonly requestNumber = requestNumber;

  @Output() item: EventEmitter<Order> = new EventEmitter();

  @Input() requestID = 1;
  @Input() status? = 'agent';

  protected orderStore = inject(OrderStore);

  ngOnInit(): void {/* empty line */}

  toggleButton(item: Order){
    // status === 'finished' && customer => show Button
    // status === 'pending' && agent => show button
    if((isFinished(item, this.isAgent())) || (isPending(item, this.isAgent()))) 
      return true;
    else 
      return false;
  }

  isAgent(){
    if(this.status ==='agent') return true;
    return false;
  }

  openOrder(item: Order){
    this.item.emit(item)
  }

}
