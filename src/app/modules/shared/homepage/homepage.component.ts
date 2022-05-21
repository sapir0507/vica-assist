import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, skip, take, takeLast, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { SessionQuery } from 'src/app/services/session/session.query';
import { User } from 'src/app/services/IUser/iuser';
import { SessionState } from 'src/app/services/session/session.store';

interface currentUser{
  username?: string,
  password?: string,
  role?: string,
  experationDate?: number,
  isLoggedIn?: boolean
}

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit, OnDestroy {

  userType: string = "customer"
  user?: Observable<User>;
  sessionId!: Observable<string>;
  token!: Observable<string>;
  private reminder: Subject<boolean> = new Subject();

  
  constructor( 
    private sessionQuery: SessionQuery,
    private route: ActivatedRoute
    ) { }

  ngOnInit(): void {
    // Capture the session ID if available
    this.sessionId = this.route
      .queryParamMap
      .pipe(map(params => params.get('session_id') || 'None'));

    // Capture the fragment if available
    this.token = this.route
      .fragment
      .pipe(map(fragment => fragment || 'None'));

    this.sessionQuery.multiProps$
    .pipe(
      takeUntil(this.reminder),
      skip(1),
      take(1)
    )
    .subscribe((item)=>{
      console.log(item)
      this.userType = item.role
      console.log(this.userType)
    })
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.reminder.next(true)
    this.reminder.complete()
  }


}
