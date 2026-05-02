export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export const ONBOARDING_CHECKLISTS: Record<string, {
  id: number;
  title: string;
  desc: string;
  path: string;
  target: string;
  position: TooltipPosition;
}[]> = {
  video: [
    { id: 0, title: 'Create your avatar', desc: 'Upload photo or choose preset', path: '/editor', target: 'body', position: 'bottom' },
    { id: 1, title: 'Write or generate script', desc: 'Enter text or ask AI', path: '/create/video', target: 'body', position: 'bottom' },
    { id: 2, title: 'Choose a voice', desc: 'Pick a voice for the avatar', path: '/voices', target: 'body', position: 'bottom' },
    { id: 3, title: 'Generate video', desc: 'Click Generate and wait', path: '/create/video', target: 'body', position: 'bottom' },
    { id: 4, title: 'Share video', desc: 'Copy link or download', path: '/links', target: 'body', position: 'bottom' },
  ],
  chat: [
    { id: 0, title: 'Create chat avatar', desc: 'Choose look and voice', path: '/chat-avatar/create', target: 'body', position: 'bottom' },
    { id: 1, title: 'Set up conversation scenario', desc: 'Set knowledge base and rules', path: '/chat-avatar/create', target: 'body', position: 'bottom' },
    { id: 2, title: 'Test your avatar', desc: 'Run a test dialog', path: '/chat-avatar', target: 'body', position: 'bottom' },
    { id: 3, title: 'Get link or embed code', desc: 'Copy for site or email', path: '/links', target: 'body', position: 'bottom' },
    { id: 4, title: 'Share with first user', desc: 'Send link to start session', path: '/links', target: 'body', position: 'bottom' },
  ],
  slides: [
    { id: 0, title: 'Upload presentation', desc: 'PowerPoint or PDF', path: '/create', target: 'body', position: 'bottom' },
    { id: 1, title: 'Choose an avatar', desc: 'Who will present slides', path: '/editor', target: 'body', position: 'bottom' },
    { id: 2, title: 'Choose a voice (slides)', desc: 'Pick voiceover', path: '/voices', target: 'body', position: 'bottom' },
    { id: 3, title: 'Generate presentation with avatar', desc: 'Click Generate', path: '/create/quick', target: 'body', position: 'bottom' },
    { id: 4, title: 'Share or download', desc: 'Send link or download', path: '/links', target: 'body', position: 'bottom' },
  ],
  localization: [
    { id: 0, title: 'Upload video', desc: 'Any format, up to X mins', path: '/video', target: 'body', position: 'bottom' },
    { id: 1, title: 'Choose target language', desc: 'Select output language', path: '/video', target: 'body', position: 'bottom' },
    { id: 2, title: 'Start localization', desc: 'Click Generate', path: '/video', target: 'body', position: 'bottom' },
    { id: 3, title: 'Check the result', desc: 'Preview translated video', path: '/video', target: 'body', position: 'bottom' },
    { id: 4, title: 'Download or share', desc: 'Export localized video', path: '/video', target: 'body', position: 'bottom' },
  ],
  fallback: [
    { id: 0, title: 'Create first avatar video', desc: 'Takes 2 minutes', path: '/create/video', target: 'body', position: 'bottom' },
    { id: 1, title: 'Translate any video', desc: 'Upload and change language', path: '/video', target: 'body', position: 'bottom' },
    { id: 2, title: 'Add avatar to presentation', desc: 'Upload slides', path: '/create', target: 'body', position: 'bottom' },
    { id: 3, title: 'Share result', desc: 'Send link to anyone', path: '/links', target: 'body', position: 'bottom' },
    { id: 4, title: 'Try chat avatar', desc: 'Start first dialog', path: '/chat-avatar/create', target: 'body', position: 'bottom' },
  ]
};

// Legacy single checklist export to prevent instant build breaks in ChecklistWidget.tsx
export const ONBOARDING_STEPS = ONBOARDING_CHECKLISTS.video;
