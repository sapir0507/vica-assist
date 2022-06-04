import { Injectable } from '@angular/core';
import { 
  EntityStore,
  StoreConfig, 
} from '@datorama/akita';
import { createRegister, Register } from './register.model';

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'register' })
export class RegisterStore extends EntityStore<Register> {

  constructor() {
    super(createRegister({
      id: 1
    }));
  }

}
