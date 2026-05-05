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
      { label: 'Начало', href: ROUTES.home, icon: 'LayoutGrid' },
      { label: 'Проекты', href: ROUTES.projects, icon: 'FolderOpen' },
      { label: 'Презентации', href: ROUTES.presentations, icon: 'Presentation' },
      { label: 'AI Чат-аватар', href: ROUTES.chatAvatar, icon: 'UserPlus' },
      { label: 'Видео', href: ROUTES.video, icon: 'Film' },
    ]
  },
  {
    title: 'Папки',
    items: [
      { label: 'Ссылки', href: ROUTES.assignments, icon: 'Link' },
      { label: 'Аналитика', href: ROUTES.analytics, icon: 'BarChart' },
      { label: 'База знаний', href: ROUTES.knowledge, icon: 'Book' },
      { label: 'Роли аватара', href: ROUTES.roles, icon: 'Sparkles' },
      { label: 'Пользователи компании', href: ROUTES.listeners, icon: 'Users' },
      { label: 'Дополнительные инстр...', href: ROUTES.marketplace, icon: 'Briefcase' },
      { label: 'Настройки', href: ROUTES.settings, icon: 'Wrench' },
      { label: 'Интеграции', href: ROUTES.integrations, icon: 'AppWindow' },
      { label: 'Помощь', href: ROUTES.help, icon: 'HelpCircle' },
      { label: 'Стартовый путеводитель', href: ROUTES.onboarding, icon: 'Rocket' },
    ]
  }
];

