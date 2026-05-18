export interface PresentationTemplate {
  id: string
  name: string
  productTypes: string[]
  accessType: string
  createdAt: string
  templateType: string
  thumbnailUrl?: string
}

export const MOCK_PRESENTATION_TEMPLATES: PresentationTemplate[] = [
  {
    id: '1',
    name: 'Onboarding',
    productTypes: ['HR'],
    accessType: 'system',
    createdAt: '2026-05-18, 10:00',
    templateType: 'Чтобы сгенерировать',
  },
  {
    id: '2',
    name: 'Corporate Newsletter',
    productTypes: ['Internal Communications'],
    accessType: 'system',
    createdAt: '2026-05-18, 10:05',
    templateType: 'Чтобы скопировать',
  },
  {
    id: '3',
    name: 'Product Presentation',
    productTypes: ['Marketing'],
    accessType: 'system',
    createdAt: '2026-05-18, 10:10',
    templateType: 'Чтобы сгенерировать',
  },
  {
    id: '4',
    name: 'Sales Presentation & Deal Qualification',
    productTypes: ['Sales'],
    accessType: 'system',
    createdAt: '2026-05-18, 10:15',
    templateType: 'Чтобы скопировать',
  },
  {
    id: '5',
    name: 'AI HR Assistant',
    productTypes: ['HR'],
    accessType: 'system',
    createdAt: '2026-05-18, 10:20',
    templateType: 'Чтобы сгенерировать',
  },
  {
    id: '6',
    name: 'AI Customer Support Manager',
    productTypes: ['Support'],
    accessType: 'system',
    createdAt: '2026-05-18, 10:25',
    templateType: 'Чтобы скопировать',
  },
  {
    id: '7',
    name: 'GDPR Compliance Training',
    productTypes: ['Compliance'],
    accessType: 'system',
    createdAt: '2026-05-18, 10:30',
    templateType: 'Чтобы сгенерировать',
  },
  {
    id: '8',
    name: 'EU AI Act Compliance Training',
    productTypes: ['Compliance'],
    accessType: 'system',
    createdAt: '2026-05-18, 10:35',
    templateType: 'Чтобы скопировать',
  },
  {
    id: '9',
    name: 'Anti-Bribery & Anti-Corruption Training',
    productTypes: ['Compliance'],
    accessType: 'system',
    createdAt: '2026-05-18, 10:40',
    templateType: 'Чтобы сгенерировать',
  },
  {
    id: '10',
    name: 'Cyber Hygiene Training',
    productTypes: ['IT Security'],
    accessType: 'system',
    createdAt: '2026-05-18, 10:45',
    templateType: 'Чтобы скопировать',
  }
]

export const PRODUCT_TYPES = [
  'HR',
  'Internal Communications',
  'Marketing',
  'Sales',
  'Support',
  'Compliance',
  'IT Security'
]

export const TEMPLATE_TYPES = [
  'Чтобы сгенерировать',
  'Чтобы скопировать',
]
