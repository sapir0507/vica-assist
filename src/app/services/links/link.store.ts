import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { createLink, Link } from './link.model';
import { ILinks } from './links';

export interface LinkState extends EntityState<Link> {
  id: number | string;
  sharedLinks: Array<ILinks> | null,
  agentLinks: Array<ILinks> | null,
  customersLinks: Array<ILinks> | null
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'link' })
export class LinkStore extends EntityStore<LinkState> {

  constructor() {
    super(createLink());
  }

}
