import { Injectable } from '@angular/core';
import { SessionQuery } from '../session/session.query';
import { SessionService } from '../session/session.service';
import { ILinks } from './links';

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

  private isLoggedIn: boolean = false;

  constructor(
    private sessionQuery: SessionQuery,
    private sessionService: SessionService
  ) { 
    sessionQuery.selectIsLoggedIn$.subscribe(
      data=> {
        this.isLoggedIn = data;
      }
    )
  }

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
    let link;
    this.isLoggedIn? 
    link = this.navbarLinks_homepage : 
    link = this.navbarLinks_homepage.concat(this.navbarLinks_login);
    console.log("links of shared Links", link)
    return link;
  }

}
