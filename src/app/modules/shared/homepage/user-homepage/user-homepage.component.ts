import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { canonicalPlace, Order } from '@vica-assist/shared';
import { OrderStatusListComponent } from '../orders-list/order-status-list/order-status-list.component';
import { BookedListComponent } from '../../bookings/booked-list/booked-list.component';
import { UserRequestsModule } from 'src/app/modules/all_modules/user-requests/user-requests.module';

type View = 'menu' | 'booking' | 'orders';

@Component({
  standalone: true,
  selector: 'user-homepage',
  templateUrl: './user-homepage.component.html',
  styleUrls: ['./user-homepage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    UserRequestsModule,
    OrderStatusListComponent,
    BookedListComponent
  ]
})
export class UserHomepageComponent {
  /** A place the visitor chose before signing in; used only when it is a real place, never as an address. */
  readonly plannedPlace = canonicalPlace(inject(ActivatedRoute).snapshot.queryParamMap.get('destination'));
  view: View = this.plannedPlace ? 'booking' : 'menu';

  constructor(private router: Router) { }

  selectedItem(item: Order){
    this.router.navigate(['final-order', item.id]);
  }

  showMenu(){
    this.view = 'menu';
  }

  showBooking(){
    this.view = 'booking';
  }

  showOrders(){
    this.view = 'orders';
  }

}
