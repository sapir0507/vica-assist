import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SessionStore } from 'src/app/services/session/session.store';


interface currentUser{
  username?: string,
  password?: string,
  role?: string,
  experationDate?: number,
  isLoggedIn?: boolean
}

@Component({
  standalone: false,
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {

  protected sessionStore = inject(SessionStore);
  isLoading: boolean = true;
  sessionId!: Observable<string>;
  token!: Observable<string>;

  constructor(
    private route: ActivatedRoute
    ) { }

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

}
