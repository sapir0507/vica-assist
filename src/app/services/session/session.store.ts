import { Store, StoreConfig, enableAkitaProdMode } from '@datorama/akita';
import { environment } from 'src/environments/environment';


export interface SessionState {
   token: string;
   //name: string;
   username: string;
   password: string;
   role: string;
   //role: string;
}

export function createInitialState(): SessionState {
  return {
    token: '',
    username: '',
    password: '',
    role: ''
  };
}

@StoreConfig({ name: 'session' })
export class SessionStore extends Store<SessionState> {
  constructor() {
    if(environment.production){ enableAkitaProdMode() }
    super(createInitialState());
  }
}