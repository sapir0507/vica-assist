import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { delay } from 'rxjs';
import { SessionState, SessionStore } from './session.store';


@Injectable()
export class SessionQuery extends Query<SessionState> {  

    allState$ = this.select();
    isLoggedIn$ = this.select('isLoggedIn');
    selectName$ = this.select('username');
    selectPass$ = this.select('password');
    selectRole$ = this.select('role');
    selectIsLoggedIn$ = this.select('isLoggedIn');
    selectExperationDate$ = this.select('experationDate');


    // Returns { username, password, role, token }
    multiProps$ = this.select(['username', 'password', 'role','isLoggedIn', 'experationDate', 'token']);
    

     // Returns [ username, password, role, token ]
    multiPropsCallback$ = this.select(
        [state => state.username, state => state.password, state => state.role, state => state.isLoggedIn, state => state.experationDate,  state => state.token]
    )


  constructor(protected override store: SessionStore) {
    super(store);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    
  }
  

}