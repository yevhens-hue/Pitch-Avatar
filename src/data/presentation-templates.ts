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
    name: 'Blank',
    productTypes: ['Startup'],
    accessType: 'system',
    createdAt: '27.02.2024, 18:15',
    templateType: 'Чтобы сгенерировать',
  },
  {
    id: '2',
    name: 'Blank',
    productTypes: ['IT Product'],
    accessType: 'system',
    createdAt: '27.02.2024, 18:16',
    templateType: 'Чтобы скопировать',
  },
  {
    id: '3',
    name: 'Marks Group',
    productTypes: ['Startup'],
    accessType: 'system',
    createdAt: '26.02.2024, 14:20',
    templateType: 'Чтобы сгенерировать',
  },
  {
    id: '4',
    name: 'Ondricka and Sons',
    productTypes: ['Startup'],
    accessType: 'system',
    createdAt: '25.02.2024, 09:10',
    templateType: 'Чтобы скопировать',
  },
  {
    id: '5',
    name: 'Christiansen and Sons',
    productTypes: ['Startup'],
    accessType: 'system',
    createdAt: '24.02.2024, 11:30',
    templateType: 'Чтобы сгенерировать',
  },
  {
    id: '6',
    name: 'Ward and Sons',
    productTypes: ['Startup'],
    accessType: 'system',
    createdAt: '23.02.2024, 16:45',
    templateType: 'Чтобы скопировать',
  },
  {
    id: '7',
    name: 'Schamberger and Sons',
    productTypes: ['Startup'],
    accessType: 'system',
    createdAt: '22.02.2024, 10:05',
    templateType: 'Чтобы сгенерировать',
  },
  {
    id: '8',
    name: 'Alex Test',
    productTypes: ['Startup'],
    accessType: 'system',
    createdAt: '21.02.2024, 13:50',
    templateType: 'Чтобы скопировать',
  },
  {
    id: '9',
    name: 'Presentation Template',
    productTypes: ['Startup'],
    accessType: 'system',
    createdAt: '20.02.2024, 15:25',
    templateType: 'Чтобы сгенерировать',
  },
]

export const PRODUCT_TYPES = [
  'Startup',
  'IT Product',
  'kos_test000',
  'vera test',
  'Тип продукта на английском 3',
  'HR (Candidate)',
  'Продукты питания',
]

export const TEMPLATE_TYPES = [
  'Чтобы сгенерировать',
  'Чтобы скопировать',
]
