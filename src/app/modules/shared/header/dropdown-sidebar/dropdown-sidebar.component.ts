import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LinkQuery } from 'src/app/services/links/link.query';
import { LinkService } from 'src/app/services/links/link.service';
import { ILinks } from 'src/app/services/links/links';
import { SessionQuery } from 'src/app/services/session/session.query';

@Component({
  selector: 'app-dropdown-sidebar',
  templateUrl: './dropdown-sidebar.component.html',
  styleUrls: ['./dropdown-sidebar.component.scss']
})
export class DropdownSidebarComponent implements OnInit {
  customersLinks: Array<ILinks> | null = null;
  agentsLinks: Array<ILinks> | null = null;
  sharedLinks: Array<ILinks> | null = null;
  logoutLink: Array<ILinks> = [{
    name: 'Logout',
    link: '#'
  }];
  isLoggedIn: boolean = false;

  constructor(
    // private SLinks: LinksService,
    private auth: AuthService, 
    private linkQuery: LinkQuery,
    private sessionQuery: SessionQuery,
    private linkService: LinkService

    ) {
    this.linkQuery.multiProps$.subscribe(data=>{
      this.sharedLinks = data.sharedLinks;
      this.agentsLinks = data.agentLinks;
      this.customersLinks = data.customersLinks;
    })

    this.sessionQuery.selectIsLoggedIn$.subscribe( data => {
      this.isLoggedIn = data;
    })
  }

  ngOnInit(): void {
    
  }

  OnLogout(){
    this.auth.logout()
    this.linkService.updateSharedLinks_WhenNotLoggedIn()
  }

}
