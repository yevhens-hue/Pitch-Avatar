export const ROUTES = {
  home: '/',
  projects: '/projects',
  templates: '/templates',
  presentationTemplates: '/presentation-templates',
  knowledge: '/knowledge',
  roles: '/roles',
  voices: '/voices',
  courses: '/courses',
  listeners: '/listeners',
  enrollments: '/enrollments',
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
  subItems?: Omit<NavItem, 'subItems'>[]
}

export const NAV_GROUPS = [
  {
    title: 'Content',
    items: [
      { label: 'Home', href: ROUTES.home, icon: 'LayoutGrid' },
      {
        label: 'Projects',
        href: ROUTES.projects,
        icon: 'FolderOpen',
        subItems: [
          { label: 'Presentations', href: ROUTES.presentations, icon: 'Presentation' },
          { label: 'AI Chat-avatar', href: ROUTES.chatAvatar, icon: 'UserPlus' },
          { label: 'Video', href: ROUTES.video, icon: 'Film' },
        ]
      },
      { label: 'Courses', href: ROUTES.courses, icon: 'GraduationCap' },
      { label: 'Templates', href: ROUTES.presentationTemplates, icon: 'LayoutTemplate' },
    ]
  },
  {
    title: 'Resources',
    items: [
      { label: 'Knowledge Base', href: ROUTES.knowledge, icon: 'Book' },
      { label: 'Avatar Roles', href: ROUTES.roles, icon: 'Sparkles' },
      { label: 'Voices', href: ROUTES.voices, icon: 'Mic' },
    ]
  },
  {
    title: 'People',
    items: [
      { label: 'Listeners', href: ROUTES.listeners, icon: 'Users' },
    ]
  },
  {
    title: 'Distribute',
    items: [
      { label: 'Assignments', href: ROUTES.enrollments, icon: 'ClipboardList' },
      { label: 'Analytics & Results', href: ROUTES.analytics, icon: 'BarChart' },
    ]
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', href: ROUTES.settings, icon: 'Settings2' },
      { label: 'Integrations', href: ROUTES.integrations, icon: 'Blocks' },
    ]
  },
];
