import { Component, OnInit, ChangeDetectionStrategy, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FinalOrderStore } from 'src/app/services/finalOrder/finalOrder.store';
import { OnWindowResizeService } from 'src/app/services/onWindowResize/on-window-resize.service';
import { OrderStore } from 'src/app/services/order/order.store';
import { Order } from 'src/interfaces/order.interface';

@Component({
  standalone: false,
  selector: 'user-homepage',
  templateUrl: './user-homepage.component.html',
  styleUrls: ['./user-homepage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserHomepageComponent implements OnInit {

  @Input() status: string = 'Pending';
  
  private step: number = 0;
  breakpoint: number | null = null;
  ScreenType: string = 'laptop';

  private finalOrderStore = inject(FinalOrderStore);
  protected orderStore = inject(OrderStore);

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

  getTitleClasses(){
    return {
      'title': true,
      'size1': this.ScreenType === 'desktop'? true : false,
      'size2': this.ScreenType === 'laptop'? true : false,
      'size3':  this.ScreenType === 'tablet' || this.ScreenType === 'phone' ? true: false,
      'title-letter-spacing-animation': true
    }
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

  onOrder(orderID: string){
    console.log(orderID)
  }

  selectedItem(item: Order){
    this.finalOrderStore.update({ order: item })
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
