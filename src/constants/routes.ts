export const ROUTES = {
  home: '/',
  projects: '/projects',
  templates: '/templates',
  knowledge: '/knowledge',
  roles: '/roles',
  voices: '/voices',
  listeners: '/listeners',
  assignments: '/assignments',
  marketplace: '/marketplace',
  analytics: '/analytics',
  review: '/review',
  profile: '/profile',
  create: '/create',
  editor: '/editor',
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = (typeof ROUTES)[RouteKey]

export interface NavItem {
  label: string
  href: RoutePath
  icon: any // or ReactNode if using Lucide
}

// Grouping like Lovable
export const NAV_GROUPS = [
  {
    title: 'CONTENT',
    items: [
      { label: 'Home', href: ROUTES.home, icon: 'Home' },
      { label: 'Projects', href: ROUTES.projects, icon: 'Folder' },
      { label: 'Templates', href: ROUTES.templates, icon: 'LayoutTemplate' },
    ]
  },
  {
    title: 'RESOURCES',
    items: [
      { label: 'Knowledge base', href: ROUTES.knowledge, icon: 'Book' },
      { label: 'Avatar roles', href: ROUTES.roles, icon: 'UserCircle' },
      { label: 'Voices', href: ROUTES.voices, icon: 'Mic' },
    ]
  },
  {
    title: 'PEOPLE',
    items: [
      { label: 'Listeners', href: ROUTES.listeners, icon: 'Users' },
    ]
  },
  {
    title: 'DISTRIBUTE',
    items: [
      { label: 'Assignments', href: ROUTES.assignments, icon: 'Send' },
      { label: 'Marketplace', href: ROUTES.marketplace, icon: 'ShoppingCart' },
    ]
  },
  {
    title: 'ANALYZE',
    items: [
      { label: 'Analytics', href: ROUTES.analytics, icon: 'BarChart' },
      { label: 'Review Queue', href: ROUTES.review, icon: 'ListChecks' },
    ]
  }
];
