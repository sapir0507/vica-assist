import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from 'src/app/services/IUser/iuser';
import { SessionQuery } from 'src/app/services/session/session.query';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {

  userType: string = "customer"
  sessionId!: Observable<string>;
  token!: Observable<string>;
  
  constructor( 
    private sessionQuery: SessionQuery,
    private route: ActivatedRoute
    ) { }

  ngOnInit(): void {
    this.userType = this.sessionQuery.isLoggedIn
    console.log(this.userType)
    // Capture the session ID if available
    this.sessionId = this.route
      .queryParamMap
      .pipe(map(params => params.get('session_id') || 'None'));

    // Capture the fragment if available
    this.token = this.route
      .fragment
      .pipe(map(fragment => fragment || 'None'));
  
  }


}
