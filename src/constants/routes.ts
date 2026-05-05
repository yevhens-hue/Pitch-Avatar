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
      { label: 'Начало', href: ROUTES.home, icon: 'LayoutGrid' },
      { label: 'Проекты', href: ROUTES.projects, icon: 'FolderOpen' },
      { label: 'Презентации', href: ROUTES.presentations, icon: 'Presentation' },
      { label: 'AI Чат-аватар', href: ROUTES.chatAvatar, icon: 'UserPlus' },
      { label: 'Видео', href: ROUTES.video, icon: 'Film' },
    ]
  }
];

