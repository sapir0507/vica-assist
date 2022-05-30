import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { LinkStore, LinkState } from './link.store';

@Injectable({ providedIn: 'root' })
export class LinkQuery extends Query<LinkState> {

  sharedLinks$ = this.select('sharedLinks')
  agentLinks$ = this.select('agentLinks')
  customersLinks$ = this.select('customersLinks')

  // Returns { sharedLinks, agentLinks, customersLinks, loading }
  multiProps$ = this.select(['sharedLinks', 'agentLinks', 'customersLinks', 'loading']);

  // Returns [ sharedLinks, agentLinks, customersLinks, loading ]
  multiPropsCallback$ = this.select(
     [state => state.sharedLinks, state => state.agentLinks, state => state.customersLinks, state=> state.loading]
  )


  constructor(protected override store: LinkStore) {
    super(store);
  }

}
