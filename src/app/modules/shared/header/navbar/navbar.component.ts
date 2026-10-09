import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { LinkStore } from 'src/app/services/links/link.store';
import { SessionStore } from 'src/app/services/session/session.store';

@Component({
  standalone: false,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  protected linkStore = inject(LinkStore);
  protected sessionStore = inject(SessionStore);
}
