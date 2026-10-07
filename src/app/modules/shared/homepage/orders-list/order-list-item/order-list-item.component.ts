import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { MyPipesModule } from 'projects/my-pipes/src/lib/my-pipes.module';
import { Order } from 'src/interfaces/order.interface';

@Component({
  standalone: true,
  selector: 'order-list-item',
  templateUrl: './order-list-item.component.html',
  styleUrls: ['./order-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MyPipesModule]
})
export class OrderListItemComponent implements OnInit {

  @Input() currentItem: Order | null = null;
  @Output() item: EventEmitter<Order> = new EventEmitter();

  ngOnInit(): void {/* empty*/}

  openOrder(item: Order){
    this.item.emit(item)
  }
}
