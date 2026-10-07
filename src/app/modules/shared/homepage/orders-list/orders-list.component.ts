import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input, effect, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MyPipesModule } from 'projects/my-pipes/src/lib/my-pipes.module';
import { OrderStore } from 'src/app/services/order/order.store';
import { isFinished, isPending, Order } from 'src/interfaces/order.interface';

@Component({
  standalone: true,
  selector: 'ordersList',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
     MyPipesModule,
     MatButtonModule,
     MatCardModule,
     MatIconModule,
     MatTabsModule,
     MatListModule,
  ]
})
export class OrdersListComponent implements OnInit {

  @Output() chosen: EventEmitter<number> = new EventEmitter();
  @Output() orderID: EventEmitter<string> = new EventEmitter();
  @Output() item: EventEmitter<Order> = new EventEmitter();
  @Output() maxIDs: EventEmitter<number> = new EventEmitter();

  @Input() requestID = 1;
  @Input() status? = 'agent';

  protected orderStore = inject(OrderStore);

  constructor() {
    effect(() => this.maxIDs.emit(this.orderStore.orders()?.length));
  }

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
