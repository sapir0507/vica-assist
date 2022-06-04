import { Injectable } from '@angular/core';
import { 
  EntityStore,
  StoreConfig, 
} from '@datorama/akita';
import { createfinalOrder, finalOrder } from './finalOrder.model';

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'finalOrder' })
export class finalOrderStore extends EntityStore<finalOrder> {

  constructor() {
    super(createfinalOrder({
      id: 1
    }));
  }

}
