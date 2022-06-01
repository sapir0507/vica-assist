import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
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
  constructor() { }

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
    console.log("homepage item from onChosen2:", item)
    this.chosenID = item.id;
    this.orderID = item.orderID;
    console.log("this.orderID from onChosen2: ", this.orderID)

  }

  onOrder(orderID: string){
    this.orderID = orderID;
    console.log("orderID from onOrder", this.orderID)
  }

}
