import { Injectable } from '@angular/core';
import { 
  EntityStore,
  StoreConfig, 
} from '@datorama/akita';
import { createfinalOrder, finalOrder } from './finalOrder.model';

/**
 * Holds the single final order currently being assembled by the
 * final-order screen (not used as a multi-entity collection).
 */
@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'finalOrder' })
export class finalOrderStore extends EntityStore<finalOrder> {

  constructor() {
    super(createfinalOrder({
      id: 1
    }));
  }

}
