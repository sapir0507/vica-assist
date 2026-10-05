import { Component, inject, OnInit } from '@angular/core';
import { ILinks } from 'src/app/services/links/links';
import { LinkStore } from 'src/app/services/links/link.store';
import { SessionQuery } from 'src/app/services/session/session.query';
import { SessionService } from 'src/app/services/session/session.service';

@Component({
  standalone: false,
  selector: 'app-dropdown-sidebar',
  templateUrl: './dropdown-sidebar.component.html',
  styleUrls: ['./dropdown-sidebar.component.scss']
})
export class DropdownSidebarComponent implements OnInit {
  logoutLink: Array<ILinks> = [{
    name: 'Logout',
    link: '#'
  }];
  isLoggedIn = false;
  protected linkStore = inject(LinkStore);

  constructor(
    private sessionQuery: SessionQuery,
    private sessionService: SessionService

    ) {
    this.sessionQuery.selectIsLoggedIn$.subscribe( data => {
      this.isLoggedIn = data;
    })
  }

  ngOnInit(): void { /* empty */ }

  OnLogout(){
    this.sessionService.logout()
    this.linkStore.updateSharedLinks_WhenNotLoggedIn()
  }

}
