import { Injectable } from '@angular/core';
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
  private navbarLinks_all: Array<ILinks> = [{
    link: '',
    name: 'Homepage'
  },
  {
    link: '/login',
    name: 'Login'
  },
  {
    link: '/register',
    name: 'Register'
  }];


  constructor() { }

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
    return this.navbarLinks_all;
  }

}
