import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { Order } from '@vica-assist/shared';
import { OrderStatusListComponent } from '../orders-list/order-status-list/order-status-list.component';
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
    OrderStatusListComponent
  ]
})
export class UserHomepageComponent {
  view: View = 'menu';

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
