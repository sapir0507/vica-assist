import { Component, DestroyRef, inject, OnInit, TemplateRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { filter } from 'rxjs/operators';
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
  private offcanvasService = inject(NgbOffcanvas);

  constructor() {
    inject(Router).events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => this.offcanvasService.dismiss());

    // The panel is rendered in <body>, so it outlives this component when the header swaps to the navbar.
    inject(DestroyRef).onDestroy(() => this.offcanvasService.dismiss());
  }

  ngOnInit(): void { /* empty */ }

  openSidebar(content: TemplateRef<unknown>) {
    this.offcanvasService.open(content, {
      position: 'end',
      panelClass: 'bg-dark',
      ariaLabelledBy: 'offcanvasNavbarLabel'
    });
  }

  OnLogout(){
    this.sessionStore.logout()
    this.linkStore.updateSharedLinks_WhenNotLoggedIn()
  }

}
