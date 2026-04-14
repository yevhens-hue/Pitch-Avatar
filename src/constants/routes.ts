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
  onboarding: '/onboarding',
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = (typeof ROUTES)[RouteKey]

export interface NavItem {
  label: string
  href: RoutePath
  icon: string // Lucide icon name string
}

// Grouping like Lovable
export const NAV_GROUPS = [
  {
    title: 'CONTENT',
    items: [
      { label: 'Home', href: ROUTES.home, icon: 'Home' },
      { label: 'Projects', href: ROUTES.projects, icon: 'Folder' },
      { label: 'Library', href: ROUTES.templates, icon: 'Users' },
      { label: 'Voices', href: ROUTES.voices, icon: 'Mic' },
      { label: 'Avatar roles', href: ROUTES.roles, icon: 'UserCircle' },
      { label: 'Avatars', href: ROUTES.onboarding, icon: 'Smile' },
    ]
  },
  {
    title: 'RESOURCES',
    items: [
      { label: 'Knowledge base', href: ROUTES.knowledge, icon: 'Book' },
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
      { label: 'Links', href: ROUTES.assignments, icon: 'Link' },
      { label: 'Marketplace', href: ROUTES.marketplace, icon: 'ShoppingCart' },
    ]
  },
  {
    title: 'ANALYZE',
    items: [
      { label: 'Analytics', href: ROUTES.analytics, icon: 'BarChart' },
    ]
  }
];

