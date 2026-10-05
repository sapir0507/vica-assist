import { Injectable, inject } from '@angular/core';
import { SessionStore } from 'src/app/services/session/session.store';
import { ILinks } from './links';

type UserRole = 'agent' | 'customer' | 'shared';

interface LinksStrategy {
  getLinks(): ILinks[];
}

@Injectable({
  providedIn: 'root'
})
export class LinksService {

  private readonly sessionStore = inject(SessionStore);

  private readonly links = {
    agent: [
      {
        link: '/add-flight',
        name: 'Add Flight'
      },
      {
        link: '/add-hotel',
        name: 'Add Hotel'
      }
    ],

    customer: [
      {
        link: '/choose-flight',
        name: 'Choose Flight'
      },
      {
        link: '/choose-hotel',
        name: 'Choose Hotel'
      }
    ],

    homepage: [
      {
        link: '/homepage',
        name: 'Homepage'
      }
    ],

    authentication: [
      {
        link: '/login',
        name: 'Login'
      },
      {
        link: '/register',
        name: 'Register'
      }
    ]
  } satisfies Record<string, ILinks[]>;

  private readonly strategies: Record<UserRole, LinksStrategy> = {
    agent: new AgentLinksStrategy(this.links.agent),
    customer: new CustomerLinksStrategy(this.links.customer),
    shared: new SharedLinksStrategy(
      this.links.homepage,
      this.links.authentication,
      this.sessionStore
    )
  };

  getLinks(role: string): ILinks[] {
    const strategy = this.strategies[role as UserRole];

    return strategy?.getLinks() ?? this.strategies.shared.getLinks();
  }
}

/**
 * Strategy for agent users.
 */
class AgentLinksStrategy implements LinksStrategy {

  constructor(
    private readonly links: ILinks[]
  ) {}

  getLinks(): ILinks[] {
    return [...this.links];
  }
}

/**
 * Strategy for customer users.
 */
class CustomerLinksStrategy implements LinksStrategy {

  constructor(
    private readonly links: ILinks[]
  ) {}

  getLinks(): ILinks[] {
    return [...this.links];
  }
}

/**
 * Strategy for shared/guest users.
 */
class SharedLinksStrategy implements LinksStrategy {

  constructor(
    private readonly homepageLinks: ILinks[],
    private readonly authenticationLinks: ILinks[],
    private readonly sessionStore: InstanceType<typeof SessionStore>
  ) {}

  getLinks(): ILinks[] {
    if (this.sessionStore.isLoggedIn()) {
      return [...this.homepageLinks];
    }

    return [
      ...this.homepageLinks,
      ...this.authenticationLinks
    ];
  }
}
