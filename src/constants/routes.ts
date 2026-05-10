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
  presentations: '/presentations',
  chatAvatar: '/chat-avatar',
  video: '/video',
  settings: '/settings',
  plans: '/plans',
  integrations: '/integrations',
  help: '/help',
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = (typeof ROUTES)[RouteKey]

export interface NavItem {
  label: string
  href: RoutePath
  icon: string // Lucide icon name string
}

export const NAV_GROUPS = [
  {
    title: '',
    items: [
      { label: 'Home', href: ROUTES.home, icon: 'LayoutGrid' },
      { label: 'Projects', href: ROUTES.projects, icon: 'FolderOpen' },
      { label: 'Presentations', href: ROUTES.presentations, icon: 'Presentation' },
      { label: 'AI Chat-avatar', href: ROUTES.chatAvatar, icon: 'UserPlus' },
      { label: 'Video', href: ROUTES.video, icon: 'Film' },
    ]
  },
  {
    title: 'Folders',
    items: [
      { label: 'Links', href: ROUTES.assignments, icon: 'Link' },
      { label: 'Analytics', href: ROUTES.analytics, icon: 'BarChart' },
      { label: 'Knowledge Base', href: ROUTES.knowledge, icon: 'Book' },
      { label: 'Avatar Roles', href: ROUTES.roles, icon: 'Sparkles' },
      { label: 'Company Users', href: ROUTES.listeners, icon: 'Users' },
      { label: 'Marketplace', href: ROUTES.marketplace, icon: 'Briefcase' },
      { label: 'Settings', href: ROUTES.settings, icon: 'Wrench' },
      { label: 'Integrations', href: ROUTES.integrations, icon: 'AppWindow' },
      { label: 'Help', href: ROUTES.help, icon: 'HelpCircle' },
      { label: 'Onboarding Guide', href: ROUTES.onboarding, icon: 'Rocket' },
    ]
  }
];

