import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { OrderService } from 'src/app/services/order/order.service';
import { Order } from 'src/interfaces/order.interface';

@Component({
  selector: 'agent-homepage',
  templateUrl: './agent-homepage.component.html',
  styleUrls: ['./agent-homepage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentHomepageComponent implements OnInit {
  step: string = 'flight';
  chosenID: number = 1;
  orderID: string | null = null;
  nextID: number = 1;
  maxID: number = 1;
  constructor(
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
  }
  onClick(){
    if(this.step ==='hotel') this.step ='flight';
    else this.step = 'hotel';
  }

  onGetMaxIDs(maxIDs: number){    
    this.maxID = maxIDs;
  }

  chosenIDNext(){
    if(this.maxID >= this.nextID + 1) this.nextID++;
  }

  chosenIDPrev(){
    if((this.nextID - 1) > 0 ) this.nextID--;
  }

  onChosen2(item: Order){
    this.chosenID = item.id;
    //this.orderID = item.orderID; //search
    this.orderID = item.id + ''; //gives all flights and hotels a common id that belongs to an order
  }

  onOrder(orderID: string){
    //this.orderID = orderID;  
  }

  updateState(){
    if(this.orderID) this.orderService.updateStatusByOrderID(this.orderID, 'finished') //search
  }

}
