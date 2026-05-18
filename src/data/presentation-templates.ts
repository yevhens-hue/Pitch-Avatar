export interface PresentationTemplate {
  id: string
  name: string
  description: string
  productTypes: string[]
  tags: string[]
  slideCount: number
  accessType: string
  createdAt: string
  templateType: 'generate' | 'copy'
  thumbnailUrl?: string
}

export const MOCK_PRESENTATION_TEMPLATES: PresentationTemplate[] = [
  {
    id: '1',
    name: 'Onboarding',
    description: 'Get new hires up to speed fast. Covers mission, tools, and first-week checklist.',
    productTypes: ['HR'],
    tags: ['HR', 'Training'],
    slideCount: 5,
    accessType: 'system',
    createdAt: '2026-05-18, 10:00',
    templateType: 'generate',
  },
  {
    id: '2',
    name: 'Corporate Newsletter',
    description: 'Monthly company updates, CEO highlights, and upcoming events in one polished deck.',
    productTypes: ['Internal Communications'],
    tags: ['Communications', 'Internal'],
    slideCount: 5,
    accessType: 'system',
    createdAt: '2026-05-18, 10:05',
    templateType: 'copy',
  },
  {
    id: '3',
    name: 'Product Presentation',
    description: 'A complete pitch: problem, solution, features, pricing, and a clear CTA.',
    productTypes: ['Marketing'],
    tags: ['Marketing', 'Sales'],
    slideCount: 5,
    accessType: 'system',
    createdAt: '2026-05-18, 10:10',
    templateType: 'generate',
  },
  {
    id: '4',
    name: 'Sales Presentation & Deal Qualification',
    description: 'Qualify prospects and close deals with ROI proof, case studies, and a next-step slide.',
    productTypes: ['Sales'],
    tags: ['Sales', 'B2B'],
    slideCount: 5,
    accessType: 'system',
    createdAt: '2026-05-18, 10:15',
    templateType: 'copy',
  },
  {
    id: '5',
    name: 'AI HR Assistant',
    description: 'Introduce your AI HR bot: capabilities, integrations, privacy, and a live demo prompt.',
    productTypes: ['HR'],
    tags: ['HR', 'AI'],
    slideCount: 5,
    accessType: 'system',
    createdAt: '2026-05-18, 10:20',
    templateType: 'generate',
  },
  {
    id: '6',
    name: 'AI Customer Support Manager',
    description: '24/7 AI support pitch: ticket resolution, escalation logic, and analytics dashboard.',
    productTypes: ['Support'],
    tags: ['Support', 'AI'],
    slideCount: 5,
    accessType: 'system',
    createdAt: '2026-05-18, 10:25',
    templateType: 'copy',
  },
  {
    id: '7',
    name: 'GDPR Compliance Training',
    description: 'Mandatory EU data privacy training: key principles, breach handling, and a knowledge check.',
    productTypes: ['Compliance'],
    tags: ['Compliance', 'Legal'],
    slideCount: 5,
    accessType: 'system',
    createdAt: '2026-05-18, 10:30',
    templateType: 'generate',
  },
  {
    id: '8',
    name: 'EU AI Act Compliance Training',
    description: 'Risk categories, prohibited practices, and high-risk AI obligations under the EU AI Act.',
    productTypes: ['Compliance'],
    tags: ['Compliance', 'AI'],
    slideCount: 5,
    accessType: 'system',
    createdAt: '2026-05-18, 10:35',
    templateType: 'copy',
  },
  {
    id: '9',
    name: 'Anti-Bribery & Anti-Corruption Training',
    description: 'Zero-tolerance policy walkthrough: definitions, gift rules, and whistleblower reporting.',
    productTypes: ['Compliance'],
    tags: ['Compliance', 'Ethics'],
    slideCount: 5,
    accessType: 'system',
    createdAt: '2026-05-18, 10:40',
    templateType: 'generate',
  },
  {
    id: '10',
    name: 'Cyber Hygiene Training',
    description: 'Password policies, phishing detection, and device security best practices for all staff.',
    productTypes: ['IT Security'],
    tags: ['IT', 'Security'],
    slideCount: 5,
    accessType: 'system',
    createdAt: '2026-05-18, 10:45',
    templateType: 'copy',
  }
]

export const PRODUCT_TYPES = [
  'All',
  'HR',
  'Internal Communications',
  'Marketing',
  'Sales',
  'Support',
  'Compliance',
  'IT Security',
]

export const TEMPLATE_TYPES = [
  'generate',
  'copy',
]
