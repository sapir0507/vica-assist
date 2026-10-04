import { Injectable } from '@angular/core';
import { Store, StoreConfig, enableAkitaProdMode } from '@datorama/akita';
import { environment } from 'src/environments/environment';

const date: Date = new Date();

export type UserRole = 'agent' | 'customer';

export interface SessionState {
   token?: string;
   username: string;
   password: string;
   role: UserRole;
   isLoggedIn: boolean;
   experationDate?: number;
}

export function createInitialState(): SessionState {
  return {
    token: '',
    experationDate: date.getDate(),
    username: '',
    password: '',
    isLoggedIn: false,
    role: 'customer'
  };
}

@Injectable({providedIn: 'root'})
@StoreConfig({ name: 'session' })
export class SessionStore extends Store<SessionState> {
  
  constructor() {
    if(environment.production){ enableAkitaProdMode() }
    super(createInitialState());
  }

}