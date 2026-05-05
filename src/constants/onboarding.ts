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
    { id: 0, title: 'Create your avatar', desc: 'Upload photo or choose a preset', path: '/editor', target: 'body', position: 'bottom' },
    { id: 1, title: 'Write or generate script', desc: 'Enter text or ask AI', path: '/create/video', target: 'body', position: 'bottom' },
    { id: 2, title: 'Choose a voice', desc: 'Pick a voice for your avatar', path: '/voices', target: 'body', position: 'bottom' },
    { id: 3, title: 'Generate video', desc: 'Click Generate and wait for result', path: '/create/video', target: 'body', position: 'bottom' },
    { id: 4, title: 'Share video', desc: 'Copy link or download file', path: '/links', target: 'body', position: 'bottom' },
  ],
  chat: [
    { id: 0, title: 'Create chat-avatar (Choose look and voice)', desc: 'Choose appearance and voice', path: '/chat-avatar/create', target: 'body', position: 'bottom' },
    { id: 1, title: 'Set up conversation scenario (Define what avatar knows and how it answers)', desc: 'Define what avatar knows and how it answers', path: '/chat-avatar/create', target: 'body', position: 'bottom' },
    { id: 2, title: 'Test your avatar (Conduct a test dialogue)', desc: 'Conduct a test dialogue', path: '/chat-avatar', target: 'body', position: 'bottom' },
    { id: 3, title: 'Get link or embed code (Copy for website or email)', desc: 'Copy for website or email', path: '/links', target: 'body', position: 'bottom' },
    { id: 4, title: 'Share with first user (Send link to launch the first session)', desc: 'Send link to launch the first session', path: '/links', target: 'body', position: 'bottom' },
  ],
  slides: [
    { id: 0, title: 'Upload presentation', desc: 'PowerPoint or PDF', path: '/create', target: 'body', position: 'bottom' },
    { id: 1, title: 'Choose an avatar', desc: 'Who will present the slides', path: '/editor', target: 'body', position: 'bottom' },
    { id: 2, title: 'Choose a voice (slides)', desc: 'Pick a voiceover', path: '/voices', target: 'body', position: 'bottom' },
    { id: 3, title: 'Generate presentation', desc: 'Click Generate', path: '/create/quick', target: 'body', position: 'bottom' },
    { id: 4, title: 'Share or download', desc: 'Send link or download', path: '/links', target: 'body', position: 'bottom' },
  ],
  localization: [
    { id: 0, title: 'Upload video', desc: 'Any format, up to 5 min', path: '/video', target: 'body', position: 'bottom' },
    { id: 1, title: 'Choose target language', desc: 'Select the destination language', path: '/video', target: 'body', position: 'bottom' },
    { id: 2, title: 'Start localization', desc: 'Click Start Processing', path: '/video', target: 'body', position: 'bottom' },
    { id: 3, title: 'Check the result', desc: 'Preview the translation', path: '/video', target: 'body', position: 'bottom' },
    { id: 4, title: 'Download or share', desc: 'Export finished video', path: '/video', target: 'body', position: 'bottom' },
  ],
  fallback: [
    { id: 0, title: 'Create first video', desc: 'Takes only 2 minutes', path: '/create/video', target: 'body', position: 'bottom' },
    { id: 1, title: 'Translate any video', desc: 'Upload and change language', path: '/video', target: 'body', position: 'bottom' },
    { id: 2, title: 'Add avatar to presentation', desc: 'Upload your presentation', path: '/create', target: 'body', position: 'bottom' },
    { id: 3, title: 'Share result', desc: 'Send link to anyone', path: '/links', target: 'body', position: 'bottom' },
    { id: 4, title: 'Try chat avatar', desc: 'Start first dialogue', path: '/chat-avatar/create', target: 'body', position: 'bottom' },
  ]
};

// Legacy single checklist export to prevent instant build breaks in ChecklistWidget.tsx
export const ONBOARDING_STEPS = ONBOARDING_CHECKLISTS.video;
