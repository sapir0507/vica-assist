import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { MyFlightsModule } from '@vica-assist/my-flights';
import { MyHotelsModule } from '@vica-assist/my-hotels';
import { UserRequestsPreviewModule } from 'src/app/modules/all_modules/user-requests-preview/user-requests-preview.module';
import { UserRequestsModule } from 'src/app/modules/all_modules/user-requests/user-requests.module';
import { OrderStore } from 'src/app/services/order/order.store';
import { Order } from '@vica-assist/shared';
import { OrdersListComponent } from '../orders-list/orders-list.component';

@Component({
  standalone: true,
  selector: 'agent-homepage',
  templateUrl: './agent-homepage.component.html',
  styleUrls: ['./agent-homepage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UserRequestsModule,
    UserRequestsPreviewModule,
    MyFlightsModule,
    MyHotelsModule,
    OrdersListComponent
  ]
})
export class AgentHomepageComponent implements OnInit {
  step = 'flight';
  chosenID = 1;
  orderID: string | null = null;
  nextID = 1;
  maxID = 1;
  private orderStore = inject(OrderStore);

  get order(): Order | undefined {
    return this.orderStore.orders()?.find(order => order.orderID == this.orderID);
  }

  ngOnInit(): void {/* empty*/}
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

  updateState(){
    if(this.orderID) this.orderStore.updateStatusByOrderID(this.orderID, 'finished') //search
  }

}
