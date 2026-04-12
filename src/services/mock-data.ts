import type {
  Project,
  Video,
  Link,
  Voice,
  Role,
  KnowledgeItem,
  ChatAvatar,
  Analytics,
  FaqItem,
  PresentationListItem,
} from '@/types'

export const MOCK_PROJECTS: Project[] = [
  { id: '1', title: 'Q1 Marketing Campaign', type: 'slides', status: 'ready', createdAt: '2026-03-20', updatedAt: '2026-03-20' },
  { id: '2', title: 'Sales Enablement', type: 'slides', status: 'published', createdAt: '2026-02-15', updatedAt: '2026-02-15' },
  { id: '3', title: 'Internal Training', type: 'video', status: 'draft', createdAt: '2026-01-10', updatedAt: '2026-01-10' },
]

export const MOCK_PRESENTATIONS: PresentationListItem[] = [
  { id: '1', name: 'Product Demo - Q1', updated: 'March 24, 2026', slides: 12, views: 45 },
  { id: '2', name: 'Sales Pitch April', updated: 'March 18, 2026', slides: 8, views: 120 },
  { id: '3', name: 'Company Overview', updated: 'February 10, 2026', slides: 15, views: 32 },
]

export const MOCK_VIDEOS: Video[] = [
  { id: 1, name: 'Product Update Q1.mp4', duration: '03:45', translatedTo: 'Spanish, German' },
  { id: 2, name: 'Onboarding Tutorial.mp4', duration: '12:20', translatedTo: 'None' },
]

export const MOCK_LINKS: Link[] = [
  { id: 1, presentation: 'Product Demo - Q1', url: 'pitch-avatar.com/v/x8K9m2', clicks: 24, leads: 5, created: 'Mar 24, 2026' },
  { id: 2, presentation: 'Sales Pitch April', url: 'pitch-avatar.com/v/12abCD', clicks: 140, leads: 12, created: 'Mar 18, 2026' },
]

export const MOCK_VOICES: Voice[] = [
  { id: 1, name: 'John Doe Voice Clone', type: 'Клонированный голос', language: 'English / Russian', date: 'Mar 01, 2026' },
  { id: 2, name: 'Libby Professional', type: 'Библиотека ИИ', language: 'English', date: 'System' },
  { id: 3, name: 'Anna Friendly', type: 'Библиотека ИИ', language: 'Russian', date: 'System' },
]

export const MOCK_ROLES: Role[] = [
  { id: 1, name: 'Специалист по продажам (IT)', description: 'Ассистент для продажи SaaS продуктов', date: 'Mar 24, 2026' },
  { id: 2, name: 'HR Менеджер', description: 'Отвечает на частые вопросы кандидатов', date: 'Feb 15, 2026' },
  { id: 3, name: 'Служба поддержки', description: 'Техническая помощь пользователям', date: 'Jan 10, 2026' },
]

export const MOCK_KNOWLEDGE: KnowledgeItem[] = [
  { id: 1, name: 'Product Specifications 2026.pdf', type: 'PDF', size: '2.4 MB', date: 'Mar 12, 2026' },
  { id: 2, name: 'Company FAQ', type: 'Text / Web', size: '12 КБ', date: 'Jan 05, 2026' },
]

export const MOCK_CHAT_AVATARS: ChatAvatar[] = [
  { id: 1, name: 'John Doe - Sales Rep', language: 'English', status: 'Active' },
  { id: 2, name: 'Maria - Tech Support', language: 'Spanish', status: 'Draft' },
]

export const MOCK_FAQ: FaqItem[] = [
  { query: 'Как загрузить видео более 500 МБ?', answer: 'Свяжитесь с нашей поддержкой для обсуждения корпоративного тарифа.' },
  { query: 'Сколько длится генерация ИИ-Скрипта?', answer: 'Обычно формирование скрипта занимает от 15 секунд до 1 минуты в зависимости от сложности и количества слайдов.' },
  { query: 'Могу ли я встроить презентацию на свой сайт?', answer: 'Да, настройте ссылку в разделе Лид-форм и используйте сгенерированный iframe код для встраивания.' },
]

export const MOCK_ANALYTICS: Analytics = {
  totalViews: 1204,
  leads: 84,
  avgViewTime: '02:45',
}
