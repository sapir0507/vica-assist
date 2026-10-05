import { Injectable, inject } from '@angular/core';
import { SessionStore } from '../session/session.store';
import { ILinks } from './links';

/** Provides the navbar links appropriate for a given user role (agent, customer, or shared/guest). */
@Injectable({
  providedIn: 'root'
})
export class LinksService {

  private navbarLinks_agents: Array<ILinks> = [{
    link: '/add-flight',
    name: 'Add Flight'
  },
  {
    link: '/add-hotel',
    name: 'Add Hotel'
  }];
  private navbarLinks_customers: Array<ILinks> = [{
    link: '/choose-flight',
    name: 'Choose Flight'
  },
  {
    link: '/choose-hotel',
    name: 'Choose Hotel'
  }];
  private navbarLinks_homepage: Array<ILinks> = [{
    link: '/homepage',
    name: 'Homepage'
  }];

  private navbarLinks_login: Array<ILinks> = [
  {
    link: '/login',
    name: 'Login'
  },
  {
    link: '/register',
    name: 'Register'
  }];

  private sessionStore = inject(SessionStore);

  /** Returns the navbar links for `'agent'`, `'customer'`, or `'shared'` (default: shared). */
  getLinks(user: string){
    switch(user){
      case 'agent':
        return this.getAgentLinks()
        break
      case 'customer':
        return this.getCutomersLinks()
        break
      case 'shared':
        return this.getSharedLinks()
        break
      default:
        return this.getSharedLinks()
        break;
    }
  }

  private getAgentLinks(){
    return this.navbarLinks_agents;
  }

  private getCutomersLinks(){
    return this.navbarLinks_customers;
  }

  private getSharedLinks(){
    const link = this.sessionStore.isLoggedIn()
        ? this.navbarLinks_homepage
        : [...this.navbarLinks_homepage, ...this.navbarLinks_login];
    console.log("links of shared Links", link)
    return link;
  }

}
