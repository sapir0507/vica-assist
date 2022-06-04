import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { Register } from './register.model';
import { RegisterStore } from './register.store';

@Injectable({ providedIn: 'root' })
export class RegisterQuery extends Query<Register> {

  allRegister$ = this.select()
  getUsername$ = this.select('username')
  getPassword$ = this.select('password')
  getEmail$ = this.select('email')
  getRole$ = this.select('role')
  getID$ = this.select('id')

  constructor(
    protected override store: RegisterStore
    ) {
    super(store);
  }

}
