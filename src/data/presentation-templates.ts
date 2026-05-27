export type ProjectType = 'Presentation + AI Avatar' | 'AI Avatar Only'

export interface PresentationTemplate {
  id: string
  name: string
  description: string
  productTypes: string[]
  projectType: ProjectType
  tags: string[]
  slideCount: number
  accessType: string
  createdAt: string
  templateType: 'generate' | 'copy'
  badge?: 'Popular' | 'New' | 'Hot'
  thumbnailUrl?: string
  selectedProjectId?: string
  isOnHomepage?: boolean
  order?: number
}

export const MOCK_PRESENTATION_TEMPLATES: PresentationTemplate[] = [
  {
    id: '1',
    name: 'Onboarding',
    badge: 'Popular',
    description: 'Get new hires up to speed fast. Covers mission, tools, and first-week checklist.',
    projectType: 'Presentation + AI Avatar',
    productTypes: ['HR'],
    tags: ['HR', 'Training'],
    slideCount: 10,
    accessType: 'system',
    createdAt: '2026-05-18, 10:00',
    templateType: 'generate',
    isOnHomepage: true,
    order: 1,
  },
  {
    id: '2',
    name: 'Corporate Newsletter',
    description: 'Monthly company updates, CEO highlights, product news, team spotlight, and upcoming events.',
    projectType: 'AI Avatar Only',
    productTypes: ['Internal Communications'],
    tags: ['Communications', 'Internal'],
    slideCount: 8,
    accessType: 'system',
    createdAt: '2026-05-18, 10:05',
    templateType: 'copy',
    isOnHomepage: true,
    order: 2,
  },
  {
    id: '3',
    name: 'Product Presentation',
    description: 'Full product pitch: problem, solution, how it works, integrations, social proof, pricing, and CTA.',
    projectType: 'Presentation + AI Avatar',
    productTypes: ['Marketing'],
    tags: ['Marketing', 'Sales'],
    slideCount: 10,
    accessType: 'system',
    createdAt: '2026-05-18, 10:10',
    templateType: 'generate',
    isOnHomepage: true,
    order: 3,
  },
  {
    id: '4',
    name: 'Sales Presentation & Deal Qualification',
    badge: 'Hot',
    description: 'Full sales cycle deck: discovery, solution fit, ROI model, objection handling, and proposed next steps.',
    projectType: 'AI Avatar Only',
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
    projectType: 'Presentation + AI Avatar',
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
    projectType: 'AI Avatar Only',
    productTypes: ['Support'],
    tags: ['Support', 'AI'],
    slideCount: 9,
    accessType: 'system',
    createdAt: '2026-05-18, 10:25',
    templateType: 'copy',
    isOnHomepage: true,
    order: 4,
  },
  {
    id: '7',
    name: 'GDPR Compliance Training',
    description: 'Full EU data privacy training: 7 principles, 6 lawful bases, individual rights, breach protocol, and quiz.',
    projectType: 'Presentation + AI Avatar',
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
    projectType: 'AI Avatar Only',
    productTypes: ['Compliance'],
    tags: ['Compliance', 'AI'],
    slideCount: 9,
    accessType: 'system',
    createdAt: '2026-05-18, 10:35',
    templateType: 'copy',
    isOnHomepage: true,
    order: 5,
  },
  {
    id: '9',
    name: 'Anti-Bribery & Anti-Corruption Training',
    description: 'Zero-tolerance walkthrough: definitions, legal framework, red flags, gift policy, third parties, and reporting.',
    projectType: 'Presentation + AI Avatar',
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
    projectType: 'AI Avatar Only',
    productTypes: ['IT Security'],
    tags: ['IT', 'Security'],
    slideCount: 10,
    accessType: 'system',
    createdAt: '2026-05-18, 10:45',
    templateType: 'copy',
    isOnHomepage: true,
    order: 6,
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
  'Research',
  'Recruiter',
  'Partnerships',
  'Investor Relations',
]

export const TEMPLATE_TYPES = [
  'generate',
  'copy',
]

export const PROJECT_TYPES_LIST: ProjectType[] = [
  'Presentation + AI Avatar',
  'AI Avatar Only',
]
