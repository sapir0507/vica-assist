import { Component, inject, OnInit } from '@angular/core';
import { ILinks } from 'src/app/services/links/links';
import { LinkStore } from 'src/app/services/links/link.store';
import { SessionStore } from 'src/app/services/session/session.store';

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
  protected linkStore = inject(LinkStore);
  protected sessionStore = inject(SessionStore);

  ngOnInit(): void { /* empty */ }

  OnLogout(){
    this.sessionStore.logout()
    this.linkStore.updateSharedLinks_WhenNotLoggedIn()
  }

}
