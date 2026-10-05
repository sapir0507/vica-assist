import { TestBed } from '@angular/core/testing';
import { LinkStore } from './link.store';

describe('LinkStore', () => {
  let store: InstanceType<typeof LinkStore>;

  beforeEach(() => {
    store = TestBed.inject(LinkStore);
  });

  it('starts with the default shared/agent/customer links', () => {
    expect(store.sharedLinks()).toEqual([
      { link: '', name: 'Homepage' },
      { link: '/login', name: 'Login' },
      { link: '/register', name: 'Register' }
    ]);
    expect(store.agentLinks()).toEqual([
      { link: '/add-flight', name: 'Add Flight' },
      { link: '/add-hotel', name: 'Add Hotel' }
    ]);
    expect(store.customersLinks()).toEqual([
      { link: '/choose-flight', name: 'Choose Flight' },
      { link: '/choose-hotel', name: 'Choose Hotel' }
    ]);
  });

  it('updateSharedLinks_AfterLogin switches sharedLinks to Homepage/Logout', () => {
    store.updateSharedLinks_AfterLogin();

    expect(store.sharedLinks()).toEqual([
      { link: '/homepage', name: 'Homepage' },
      { link: '#', name: 'Logout' }
    ]);
  });

  it('updateSharedLinks_WhenNotLoggedIn switches sharedLinks to Homepage/Login/Register', () => {
    store.updateSharedLinks_AfterLogin();
    store.updateSharedLinks_WhenNotLoggedIn();

    expect(store.sharedLinks()).toEqual([
      { link: '/homepage', name: 'Homepage' },
      { link: '/login', name: 'Login' },
      { link: '/register', name: 'Register' }
    ]);
  });

  it('neither login nor logout transition touches agentLinks/customersLinks', () => {
    const agentLinksBefore = store.agentLinks();
    const customersLinksBefore = store.customersLinks();

    store.updateSharedLinks_AfterLogin();
    store.updateSharedLinks_WhenNotLoggedIn();

    expect(store.agentLinks()).toEqual(agentLinksBefore);
    expect(store.customersLinks()).toEqual(customersLinksBefore);
  });
});
