import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { delay } from 'rxjs';
import { SessionState, SessionStore } from './session.store';


@Injectable()
export class SessionQuery extends Query<SessionState> {  

    allState$ = this.select();
    isLoggedIn$ = this.select(state => {
      console.log("session query -> state.role = ", state.role)
      state.role
    }).pipe(
      delay(1000)
    );
    selectName$ = this.select('username');
    selectPass$ = this.select('password');
    selectRole$ = this.select('role');


    // Returns { username, password, role, token }
    multiProps$ = this.select(['username', 'password', 'role', 'token']);
    

     // Returns [ username, password, role, token ]
    multiPropsCallback$ = this.select(
        [state => state.username, state => state.password, state => state.role, state => state.token]
    )
    


  constructor(protected override store: SessionStore) {
    super(store);
  }

  get isLoggedIn() {
    return this.getValue().role;
  }

}