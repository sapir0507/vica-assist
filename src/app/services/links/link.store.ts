import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ILinks } from './links';

export interface LinkState {
  sharedLinks: ILinks[];
  agentLinks: ILinks[];
  customersLinks: ILinks[];
}

const initialState: LinkState = {
  sharedLinks: [
    { link: '/homepage', name: 'Homepage' },
    { link: '/login', name: 'Login' },
    { link: '/register', name: 'Register' }
  ],
  agentLinks: [
    { link: '/add-flight', name: 'Add Flight' },
    { link: '/add-hotel', name: 'Add Hotel' }
  ],
  customersLinks: [
    { link: '/choose-flight', name: 'Choose Flight' },
    { link: '/choose-hotel', name: 'Choose Hotel' }
  ]
};

export const LinkStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    updateSharedLinks(sharedLinks: ILinks[]) {
      patchState(store, { sharedLinks });
    },
    updateSharedLinks_AfterLogin() {
      patchState(store, {
        sharedLinks: [
          { link: '/homepage', name: 'Homepage' },
          { link: '#', name: 'Logout' }
        ]
      });
    },
    updateSharedLinks_WhenNotLoggedIn() {
      patchState(store, {
        sharedLinks: [
          { link: '/homepage', name: 'Homepage' },
          { link: '/login', name: 'Login' },
          { link: '/register', name: 'Register' }
        ]
      });
    }
  }))
);
