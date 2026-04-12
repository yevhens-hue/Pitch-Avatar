export const ROUTES = {
  home: '/',
  create: '/create',
  profile: '/profile',
  projects: '/projects',
  presentations: '/presentations/library',
  chatAvatar: '/chat-avatar',
  video: '/video',
  links: '/links',
  analytics: '/analytics',
  knowledge: '/knowledge',
  roles: '/roles',
  voices: '/voices',
  help: '/help',
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = (typeof ROUTES)[RouteKey]

export interface NavItem {
  label: string
  href: RoutePath
  icon: string
}

export const MAIN_NAV: NavItem[] = [
  { label: 'Начало', href: ROUTES.home, icon: '🏠' },
  { label: 'Проекты', href: ROUTES.projects, icon: '📂' },
  { label: 'Презентации', href: ROUTES.presentations, icon: '📄' },
  { label: 'AI Чат-аватар', href: ROUTES.chatAvatar, icon: '🤖' },
  { label: 'Видео', href: ROUTES.video, icon: '🎬' },
]

export const SECONDARY_NAV: NavItem[] = [
  { label: 'Ссылки', href: ROUTES.links, icon: '🔗' },
  { label: 'Аналитика', href: ROUTES.analytics, icon: '📈' },
  { label: 'База знаний', href: ROUTES.knowledge, icon: '📚' },
  { label: 'Роли аватара', href: ROUTES.roles, icon: '🎓' },
  { label: 'Голоса', href: ROUTES.voices, icon: '🎙️' },
  { label: 'Настройки', href: ROUTES.profile, icon: '⚙️' },
  { label: 'Помощь', href: ROUTES.help, icon: '❓' },
]
