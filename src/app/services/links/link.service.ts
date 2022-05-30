import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ID } from '@datorama/akita';
import { tap } from 'rxjs/operators';
import { Link } from './link.model';
import { LinkStore } from './link.store';
import { ILinks } from './links';

@Injectable({ providedIn: 'root' })
export class LinkService {




  constructor(
    private linkStore: LinkStore, 
    private http: HttpClient
    ) {
  } 

  async updateSharedLinks(sharedLinks: Array<ILinks>){
    this.linkStore.setLoading(true);
    try 
    {
        this.linkStore.update(state => ({
           sharedLinks: sharedLinks
        }));
        this.linkStore.setLoading(false);
    } catch(error) {
      this.linkStore.setLoading(false);
      this.linkStore.setError(error);
    }
    
  }

  async updateAgentLinks(agentLinks: Array<ILinks>){
    this.linkStore.setLoading(true);
    try 
    {
        this.linkStore.update(state => ({
            agentLinks: agentLinks
        }));
    } catch(error) {
      this.linkStore.setLoading(false);
      this.linkStore.setError(error);
    }
  }

  async updateCustomersLinks(customersLinks: Array<ILinks>){
    this.linkStore.setLoading(true);
    try 
    {
        this.linkStore.update(state => ({
          customersLinks: customersLinks
        }));
    } catch(error) {
      this.linkStore.setLoading(false);
      this.linkStore.setError(error);
    }
  }

  updateSharedLinks_AfterLogin(){
    const newShared = [{
      link: '/homepage',
      name: 'Homepage'
    },{
      link:'#',
      name: 'Logout'
    }]

    this.updateSharedLinks(newShared)
  }

  updateSharedLinks_WhenNotLoggedIn(){
    const newShared = [{
      link: '/homepage',
      name: 'Homepage'
    },
    {
      link: '/login',
      name: 'Login'
    },
    {
      link: '/register',
      name: 'Register'
    }]

    this.updateSharedLinks(newShared)
  }


  get() {
    return this.http.get<Link[]>('https://api.com').pipe(tap(entities => {
      this.linkStore.set(entities);
    }));
  }

  add(link: Link) {
    this.linkStore.add(link);
  }

  update(id: any, link: Partial<Link>) {
    this.linkStore.update(id, link);
  }

  remove(id: ID) {
    this.linkStore.remove(id);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.linkStore.destroy();
  }

}
