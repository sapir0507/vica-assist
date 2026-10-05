import { Component, inject, Input, OnInit } from '@angular/core';
import { LinkStore } from 'src/app/services/links/link.store';
import { ILinks } from 'src/app/services/links/links';
import { SessionStore } from 'src/app/services/session/session.store';
// import { LinksService } from 'src/app/services/links/links.service';



@Component({
  standalone: false,
  selector: 'app-links',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.scss']
})
export class LinksComponent implements OnInit {
  @Input() currentLinks?: Array<ILinks> | null = null;

  @Input() isDropDown?: boolean | null = null;
  @Input() isSideBar?: boolean | null = null;

  @Input() isLogout?: boolean | null = null;
  @Input() username?: string | null = null;

  private linkStore = inject(LinkStore);
  private sessionStore = inject(SessionStore);

  ngOnInit(): void {/* empty */ }

  onLogout(){
    this.sessionStore.logout()
    this.linkStore.updateSharedLinks_WhenNotLoggedIn()
  }

  
}
