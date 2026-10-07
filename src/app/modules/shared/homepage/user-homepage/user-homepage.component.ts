import { UserRequestsPreviewModule } from 'src/app/modules/all_modules/user-requests-preview/user-requests-preview.module';


import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Router } from '@angular/router';

import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';

import { OnWindowResizeService } from 'src/app/services/onWindowResize/on-window-resize.service';
import { Order } from 'src/interfaces/order.interface';

import { OrderStatusListComponent } from '../orders-list/order-status-list/order-status-list.component';
import { UserRequestsModule } from 'src/app/modules/all_modules/user-requests/user-requests.module';

@Component({
  standalone: true,
  selector: 'user-homepage',
  templateUrl: './user-homepage.component.html',
  styleUrls: ['./user-homepage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,
    MatGridListModule,
    MatTabsModule,
     UserRequestsModule,
    UserRequestsPreviewModule,
    OrderStatusListComponent
  ]
})
export class UserHomepageComponent implements OnInit {

  @Input() status = 'Pending';
  
  private step = 0;
  breakpoint: number | null = null;
  ScreenType = 'laptop';

  constructor(
    private router: Router,
    private windowResizeService: OnWindowResizeService
  ) { }

  ngOnInit(): void {
    this.breakpoint = (window.innerWidth <= 600) ? 1: 2;
    this.ScreenType = (window.innerWidth <= 600) ? 'phone': 'laptop';
    this.ScreenType = this.windowResizeService.screenType;
    this.breakpoint = this.windowResizeService.screenType == 'laptop'? 2:1;
  }

  getTitleClasses(): Record<string, boolean> {
  return {
    title: true,
    size1: this.ScreenType === 'desktop',
    size2: this.ScreenType === 'laptop',
    size3: this.ScreenType === 'tablet' || this.ScreenType === 'phone',
    'title-letter-spacing-animation': true
  };
}
 

  handleSizeEvent(event: UIEvent){
    const newType = this.windowResizeService.handleSizeEvent(event)
   
    switch (newType) {
      case 'phone':
        this.breakpoint = 1;
        break;
      case 'tablet':
        this.breakpoint = 2;
        break;
      case 'laptop':
        this.breakpoint = 2;
        break;
      case 'desktop':
        this.breakpoint = 2;
        break;
      default:
        this.breakpoint = 2;
        break;
    }
    
  }

  handleFontSizeEvent(event: UIEvent){
    this.ScreenType = this.windowResizeService.handleSizeEvent(event)
  }

  onChosen(id: number /* order id */){
    this.router.navigate(['final-order', id])
  }

  selectedItem(item: Order){
    this.onChosen(item.id)
  }

  getChoice(){
    return this.step;
  }
 
  newOrder(){
    this.step = 1;
  }

  seeAllOrders(){
    this.step = 2;
  }

  goBack(){
    this.step = 0;
  }

}
