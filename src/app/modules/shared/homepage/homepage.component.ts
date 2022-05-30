import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, take, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { SessionQuery } from 'src/app/services/session/session.query';


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

  userType?: string;
  isLoading: boolean = true;
  sessionId!: Observable<string>;
  token!: Observable<string>;
  private reminder: Subject<boolean> = new Subject();

  
  constructor( 
    private sessionQuery: SessionQuery,
    private route: ActivatedRoute
    ) {
      this.isLoading = false;
      this.sessionQuery.multiProps$
    .pipe
    (
      take(2),
      takeUntil(this.reminder)
    )
    .subscribe((item)=>{
      this.userType = item.role
    })
    this.isLoading = true;
     }

  ngOnInit(): void {
    // Capture the session ID if available
    this.isLoading = false;
    console.log("on init", this.isLoading)
    this.sessionId = this.route
      .queryParamMap
      .pipe(map(params => params.get('session_id') || 'None'));

    // Capture the fragment if available
    this.token = this.route
      .fragment
      .pipe(map(fragment => fragment || 'None'));
    this.isLoading = true
  }

  ngOnDestroy(): void {
    this.reminder.next(true)
    this.reminder.complete()
  }


}
