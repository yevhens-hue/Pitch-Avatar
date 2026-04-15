export const ONBOARDING_STEPS = [
  {
    id: 0,
    title: 'Pick a Creation Method',
    desc: 'Select "Quick Presentation" to start with AI. It\'s the fastest way to get your first result.',
    path: '/',
    target: '[data-tour="quick-start"]',
    position: 'bottom' as const,
    trigger: (path: string) => path === '/' || path.includes('onboarding')
  },
  {
    id: 1,
    title: 'Pick a Persona',
    desc: 'Choose an AI Avatar that matches your brand tone. You can preview voices here too.',
    path: '/create?type=quick&step=2',
    target: '[data-tour="avatar-select"]',
    position: 'left' as const,
    trigger: (path: string, search: string) => path.includes('/create') && search.includes('step=2')
  },
  {
    id: 2,
    title: 'Feed the AI',
    desc: 'Drag your PDF or PPTX here. The AI will read every slide to build your script.',
    path: '/create?type=quick&step=5',
    target: '[data-tour="upload-zone"]',
    position: 'right' as const,
    trigger: (path: string, search: string) => path.includes('/create') && search.includes('step=5')
  },
  {
    id: 3,
    title: 'Final Polish',
    desc: 'Review your settings and click "Next" (on step 6) to prepare for generation.',
    path: '/create?type=quick&step=6',
    target: '[data-tour="generate-btn"]',
    position: 'top' as const,
    trigger: (path: string, search: string) => path.includes('/create') && search.includes('step=6')
  },
  {
    id: 4,
    title: 'Broadcast your Avatar',
    desc: 'Copy this link and send it to your clients. You\'ll see analytics when they watch.',
    path: '/',
    target: '[data-tour="share-link"]',
    position: 'bottom' as const,
    trigger: (path: string) => path === '/' && typeof document !== 'undefined' && document.querySelector('[data-tour="share-link"]') !== null
  }
];
