import { Component, inject } from '@angular/core';
import { LinkStore } from 'src/app/services/links/link.store';
import { SessionStore } from 'src/app/services/session/session.store';

@Component({
  standalone: false,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  protected linkStore = inject(LinkStore);
  protected sessionStore = inject(SessionStore);
}
