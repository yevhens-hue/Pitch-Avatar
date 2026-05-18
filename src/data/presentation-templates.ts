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
  badge?: 'Popular' | 'New' | 'Hot'
  thumbnailUrl?: string
}

export const MOCK_PRESENTATION_TEMPLATES: PresentationTemplate[] = [
  {
    id: '1',
    name: 'Onboarding',
    badge: 'Popular',
    description: 'Get new hires up to speed fast. Covers mission, tools, and first-week checklist.',
    productTypes: ['HR'],
    tags: ['HR', 'Training'],
    slideCount: 10,
    accessType: 'system',
    createdAt: '2026-05-18, 10:00',
    templateType: 'generate',
  },
  {
    id: '2',
    name: 'Corporate Newsletter',
    description: 'Monthly company updates, CEO highlights, product news, team spotlight, and upcoming events.',
    productTypes: ['Internal Communications'],
    tags: ['Communications', 'Internal'],
    slideCount: 8,
    accessType: 'system',
    createdAt: '2026-05-18, 10:05',
    templateType: 'copy',
  },
  {
    id: '3',
    name: 'Product Presentation',
    description: 'Full product pitch: problem, solution, how it works, integrations, social proof, pricing, and CTA.',
    productTypes: ['Marketing'],
    tags: ['Marketing', 'Sales'],
    slideCount: 10,
    accessType: 'system',
    createdAt: '2026-05-18, 10:10',
    templateType: 'generate',
  },
  {
    id: '4',
    name: 'Sales Presentation & Deal Qualification',
    badge: 'Hot',
    description: 'Full sales cycle deck: discovery, solution fit, ROI model, objection handling, and proposed next steps.',
    productTypes: ['Sales'],
    tags: ['Sales', 'B2B'],
    slideCount: 9,
    accessType: 'system',
    createdAt: '2026-05-18, 10:15',
    templateType: 'copy',
  },
  {
    id: '5',
    name: 'AI HR Assistant',
    description: 'AI HR bot introduction: problem, capabilities, how it works, integrations, ROI, and live demo.',
    productTypes: ['HR'],
    tags: ['HR', 'AI'],
    slideCount: 8,
    accessType: 'system',
    createdAt: '2026-05-18, 10:20',
    templateType: 'generate',
  },
  {
    id: '6',
    name: 'AI Customer Support Manager',
    description: 'Full AI support pitch: Tier-1 resolution, smart escalation, knowledge base, analytics, and ROI.',
    productTypes: ['Support'],
    tags: ['Support', 'AI'],
    slideCount: 9,
    accessType: 'system',
    createdAt: '2026-05-18, 10:25',
    templateType: 'copy',
  },
  {
    id: '7',
    name: 'GDPR Compliance Training',
    description: 'Full EU data privacy training: 7 principles, 6 lawful bases, individual rights, breach protocol, and quiz.',
    productTypes: ['Compliance'],
    tags: ['Compliance', 'Legal'],
    slideCount: 10,
    accessType: 'system',
    createdAt: '2026-05-18, 10:30',
    templateType: 'generate',
  },
  {
    id: '8',
    name: 'EU AI Act Compliance Training',
    badge: 'New',
    description: 'Risk tiers, prohibited practices, GPAI rules, high-risk obligations, and your AI Register duties.',
    productTypes: ['Compliance'],
    tags: ['Compliance', 'AI'],
    slideCount: 9,
    accessType: 'system',
    createdAt: '2026-05-18, 10:35',
    templateType: 'copy',
  },
  {
    id: '9',
    name: 'Anti-Bribery & Anti-Corruption Training',
    description: 'Zero-tolerance walkthrough: definitions, legal framework, red flags, gift policy, third parties, and reporting.',
    productTypes: ['Compliance'],
    tags: ['Compliance', 'Ethics'],
    slideCount: 9,
    accessType: 'system',
    createdAt: '2026-05-18, 10:40',
    templateType: 'generate',
  },
  {
    id: '10',
    name: 'Cyber Hygiene Training',
    description: 'Full security training: threat landscape, passwords, phishing, social engineering, device & network safety.',
    productTypes: ['IT Security'],
    tags: ['IT', 'Security'],
    slideCount: 10,
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
