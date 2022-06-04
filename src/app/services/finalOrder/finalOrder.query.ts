import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { finalOrder } from './finalOrder.model';
import { finalOrderStore } from './finalOrder.store';

@Injectable({ providedIn: 'root' })
export class finalOrderQuery extends Query<finalOrder> {

  allfinalOrder$ = this.select()
  getOrder$ = this.select('order')
  getHotel$ = this.select('hotel')
  getFlight$ = this.select('flight')
  getID$ = this.select('id')

  constructor(
    protected override store: finalOrderStore
    ) {
    super(store);
  }

}
