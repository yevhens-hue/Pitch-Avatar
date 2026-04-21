export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export const ONBOARDING_STEPS: {
  id: number;
  title: string;
  desc: string;
  path: string;
  target: string;
  position: TooltipPosition;
  video: string;
  trigger: (...args: string[]) => boolean;
}[] = [
  {
    id: 0,
    title: 'Pick a Creation Method',
    desc: 'Click "Quick Presentation" to add an AI avatar or voice to your slides — the fastest way to get your first result.',
    path: '/',
    target: '[data-tour="creation-method"]',
    position: 'bottom' as const,
    video: 'https://cdn.pixabay.com/video/2020/09/11/49520-458145265_tiny.mp4',
    trigger: (path: string) => path === '/' || path.includes('onboarding'),
  },
  {
    id: 1,
    title: 'Upload Your Slides',
    desc: 'Drag & drop your PDF or PPTX here. The AI reads every slide and builds a voiceover script automatically.',
    path: '/create/quick',
    target: '[data-tour="upload-zone"]',
    position: 'bottom' as const,
    video: 'https://cdn.pixabay.com/video/2020/09/11/49520-458145265_tiny.mp4',
    trigger: (path: string) => path === '/create/quick',
  },
  {
    id: 2,
    title: 'Choose Your AI Avatar',
    desc: 'Pick the avatar that best matches your brand. You can also upload your own photo.',
    path: '/create/quick?step=2',
    target: '[data-tour="avatar-select"]',
    position: 'left' as const,
    video: 'https://cdn.pixabay.com/video/2020/09/11/49520-458145265_tiny.mp4',
    trigger: (path: string, search: string) =>
      path === '/create/quick' && search.includes('step=2'),
  },
  {
    id: 3,
    title: 'Generate Your Presentation',
    desc: 'Review settings and click Generate. Your AI avatar presentation will be ready in seconds.',
    path: '/create/quick?step=4',
    target: '[data-tour="generate-btn"]',
    position: 'top' as const,
    video: 'https://cdn.pixabay.com/video/2020/09/11/49520-458145265_tiny.mp4',
    trigger: (path: string, search: string) =>
      path === '/create/quick' && search.includes('step=4'),
  },
  {
    id: 4,
    title: 'Share Your Presentation',
    desc: 'Send this link to your audience. You\'ll see live analytics as they watch and interact.',
    path: '/',
    target: '[data-tour="share-link"]',
    position: 'bottom' as const,
    video: 'https://cdn.pixabay.com/video/2020/09/11/49520-458145265_tiny.mp4',
    trigger: (path: string) =>
      path === '/' &&
      typeof document !== 'undefined' &&
      document.querySelector('[data-tour="share-link"]') !== null,
  },
];
