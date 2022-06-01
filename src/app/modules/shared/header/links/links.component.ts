import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LinkService } from 'src/app/services/links/link.service';
import { ILinks } from 'src/app/services/links/links';
import { SessionService } from 'src/app/services/session/session.service';
// import { LinksService } from 'src/app/services/links/links.service';



@Component({
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


 
  constructor(
    private auth: AuthService,
    private sessionService: SessionService,
    private linkService: LinkService
    ) { 
  }

  ngOnInit(): void {
   
   
  }

  onLogout(){
    this.auth.logout()
    this.linkService.updateSharedLinks_WhenNotLoggedIn()
  }

  
}
