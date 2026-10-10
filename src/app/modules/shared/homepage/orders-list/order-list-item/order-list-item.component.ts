import { DatePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MyPipesModule } from '@vica-assist/my-pipes';
import { Order } from '@vica-assist/shared';

@Component({
  standalone: true,
  selector: 'order-list-item',
  templateUrl: './order-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MyPipesModule, MatButtonModule, MatIconModule]
})
export class OrderListItemComponent implements OnInit {

  @Input() currentItem: Order | null = null;
  @Output() item: EventEmitter<Order> = new EventEmitter();

  ngOnInit(): void {/* empty*/}

  openOrder(item: Order){
    this.item.emit(item)
  }
}
