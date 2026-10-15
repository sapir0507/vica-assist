import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MyPipesModule } from '@vica-assist/my-pipes';
import { Order, requestNumber } from '@vica-assist/shared';
import { OfferSummaryComponent } from '../offer-summary/offer-summary.component';

@Component({
  standalone: true,
  selector: 'order-list-item',
  templateUrl: './order-list-item.component.html',
  styleUrl: './order-list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, MyPipesModule, MatButtonModule, MatIconModule, OfferSummaryComponent]
})
export class OrderListItemComponent implements OnInit {
  protected readonly requestNumber = requestNumber;

  @Input() currentItem: Order | null = null;
  @Input() showOffers = false;
  /** Offers a link to the request's status page; for the customer's own lists. */
  @Input() trackLink = false;
  @Output() item: EventEmitter<Order> = new EventEmitter();

  ngOnInit(): void {/* empty*/}

  openOrder(item: Order){
    this.item.emit(item)
  }
}
