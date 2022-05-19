import { Store, StoreConfig, enableAkitaProdMode } from '@datorama/akita';
import { environment } from 'src/environments/environment';

const date: Date = new Date();

export interface SessionState {
   token?: string;
   username: string;
   password: string;
   role: string;
   experationDate?: Date;
}

export function createInitialState(): SessionState {
  return {
    token: '',
    experationDate: date,
    username: '',
    password: '',
    role: 'customer'
  };
}

@StoreConfig({ name: 'session' })
export class SessionStore extends Store<SessionState> {
  constructor() {
    if(environment.production){ enableAkitaProdMode() }
    super(createInitialState());
  }
}