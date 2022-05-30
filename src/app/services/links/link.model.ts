import { ILinks } from "./links";


export interface Link {
  id: number | string;
  sharedLinks: Array<ILinks> | null,
  agentLinks: Array<ILinks> | null,
  customersLinks: Array<ILinks> | null
}

export function createLink(params?: Partial<Link>) {
  return {
   id: 0,
   sharedLinks: [{
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
  }],
   agentLinks: [{
    link: '/add-flight',
    name: 'Add Flight'
  },
  {
    link: '/add-hotel',
    name: 'Add Hotel'
  }],
   customersLinks: [{
    link: '/choose-flight',
    name: 'Choose Flight'
  },
  {
    link: '/choose-hotel',
    name: 'Choose Hotel'
  }]
  } as Link;
}

