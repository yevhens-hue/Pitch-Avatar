// Presentation по итогам всего испытательного срока в Pitch Avatar.
// Источник истины — финальная версия презентации (Probation_Presentation, 12 слайдов).
// Здесь к ней добавлены два обрамляющих слайда (сводка + карта инициатив)
// для интерактивного формата плеера, по аналогии с roadmap первого месяца.

export type StatusKind = 'done' | 'progress' | 'review' | 'blocked' | 'planned';

export interface TaskLink {
  label: string;
  url: string;
}

export interface ProbationMetric {
  label: string;
  value: string;
  accent?: 'blue' | 'green' | 'amber' | 'red';
}

export interface OverviewItem {
  name: string;
  status: StatusKind;
}

export type SlideContent =
  | { kind: 'summary'; metrics: ProbationMetric[] }
  | { kind: 'overview'; items: OverviewItem[] }
  | { kind: 'task'; status: string; statusKind: StatusKind; deliverables: string[]; links?: TaskLink[] }
  | { kind: 'list'; items: string[] }
  | { kind: 'closing'; points: string[] };

export interface ProbationSlide {
  id: number;
  tag: string;
  title: string;
  subtitle?: string;
  script: string;
  content: SlideContent;
}

// Человекочитаемые подписи статусов (для бейджей).
export const STATUS_LABELS: Record<StatusKind, string> = {
  done: 'Done',
  progress: 'In progress',
  review: 'In review',
  blocked: 'Blocked',
  planned: 'Planned',
};

export const probationSlides: ProbationSlide[] = [
  {
    id: 1,
    tag: 'Probation Review · June 2026',
    title: 'Probation Period Summary at Pitch Avatar',
    subtitle: 'What was done, what is in progress, and what is planned for product initiatives',
    script:
      'Good afternoon! Let me summarize the entire probation period. During this time I worked on eight product initiatives: some have already been delivered and handed off to development, some are actively in progress, and one is in planning. Each has PRD, epic, design tasks, and working prototypes.',
    content: {
      kind: 'summary',
      metrics: [
        { label: 'Product initiatives', value: '8', accent: 'blue' },
        { label: 'Jira epics', value: '6', accent: 'blue' },
        { label: 'Working prototypes', value: '5', accent: 'green' },
        { label: 'PRDs / tech designs', value: '4', accent: 'amber' },
      ],
    },
  },
  {
    id: 2,
    tag: 'Overview · All initiatives',
    title: 'Initiative map and their statuses',
    subtitle: 'Summary across all areas',
    script:
      "Here's the full picture. Listeners CRUD has been handed off to development. Templates, Sara, Enrollments and quotas are actively in progress. Billing is temporarily blocked by payment system issues. Coach Role is in UI/UX approval, and the universal project editor is planned.",
    content: {
      kind: 'overview',
      items: [
        { name: 'Templates', status: 'progress' },
        { name: 'AI Assistant Sara', status: 'progress' },
        { name: 'Billing Management', status: 'blocked' },
        { name: 'Listeners CRUD', status: 'done' },
        { name: 'Enrollments', status: 'progress' },
        { name: 'Enrollments Quota & Billing', status: 'progress' },
        { name: 'Coach Role', status: 'review' },
        { name: 'Universal Project Editing', status: 'planned' },
      ],
    },
  },
  {
    id: 3,
    tag: 'Initiative 1 · Templates',
    title: 'Templates (Templates)',
    subtitle: 'Status: In progress',
    script:
      'The first key initiative is Templates. We have prepared PRD, Epic and design stories. Prototypes for the client side and workspace are ready. Design is also fully completed. The feature is in active development.',
    content: {
      kind: 'task',
      status: 'In progress',
      statusKind: 'progress',
      deliverables: [
        'PRD and Epic — done',
        'Design stories — done',
        'Prototypes: client side and workspace',
        'Design — fully completed',
      ],
    },
  },
  {
    id: 4,
    tag: 'Initiative 2 · Sara',
    title: 'AI Assistant Sara',
    subtitle: 'Status: In progress · research phase',
    script:
      'Next important block — AI Assistant Sara. PRD done, Epic created, working prototype built, and the feature has been successfully presented. We are now in the research and refinement phase.',
    content: {
      kind: 'task',
      status: 'In progress · research phase',
      statusKind: 'progress',
      deliverables: [
        'PRD and Epic — done',
        'Working prototype — built',
        'Feature presented',
      ],
      links: [{ label: 'Epic R4C-25315', url: 'https://roi4cio.atlassian.net/browse/R4C-25315' }],
    },
  },
  {
    id: 5,
    tag: 'Initiative 3 · Billing',
    title: 'Billing Management',
    subtitle: 'Status: Delayed due to payment system issues',
    script:
      'For billing management, the Epic and design task are ready. A prototype has also been built and tested. Timelines are slightly shifting due to payment system integration challenges.',
    content: {
      kind: 'task',
      status: 'Delayed due to payment issues',
      statusKind: 'blocked',
      deliverables: ['Epic and design task — done', 'Prototype — built and tested'],
      links: [
        { label: 'Epic R4C-26173', url: 'https://roi4cio.atlassian.net/browse/R4C-26173' },
        { label: 'Design R4C-26207', url: 'https://roi4cio.atlassian.net/browse/R4C-26207' },
        { label: 'Prototype /settings', url: 'https://pitch-avatar-lab.vercel.app/settings' },
      ],
    },
  },
  {
    id: 6,
    tag: 'Initiative 4 · Listeners',
    title: 'Listeners CRUD',
    subtitle: 'Status: Handed off to PM',
    script:
      'Listener management functionality (Listeners CRUD) is complete on my side: Epic, design stories and working prototype are ready. The task has been fully handed off to the Project Manager.',
    content: {
      kind: 'task',
      status: 'Handed off to PM',
      statusKind: 'done',
      deliverables: ['Epic and design stories — done', 'Working prototype — ready', 'Handed off to PM'],
      links: [
        { label: 'Epic R4C-26431', url: 'https://roi4cio.atlassian.net/browse/R4C-26431' },
        { label: 'Prototype /listeners', url: 'https://pitch-avatar-lab.vercel.app/listeners' },
      ],
    },
  },
  {
    id: 7,
    tag: 'Initiative 5 · Enrollments',
    title: 'Enrollments',
    subtitle: 'Status: In progress · last block remaining',
    script:
      'We continue work on Enrollments. The design task has been created and the process is in active phase — we just need to complete the last block of development.',
    content: {
      kind: 'task',
      status: 'In progress · last block remaining',
      statusKind: 'progress',
      deliverables: ['Design task — created', 'Prototype — ready', 'Development — in progress'],
      links: [
        { label: 'Design R4C-27073', url: 'https://roi4cio.atlassian.net/browse/R4C-27073' },
        { label: 'Prototype /enrollments', url: 'https://pitch-avatar-lab.vercel.app/enrollments' },
      ],
    },
  },
  {
    id: 8,
    tag: 'Initiative 6 · Quota & Billing',
    title: 'Enrollments Quota & Billing',
    subtitle: 'Status: Tech design done · payment integration pending',
    script:
      'Related task for Enrollments quota and billing. The technical design is fully complete. We are waiting for payment system integration to be finished for the final launch.',
    content: {
      kind: 'task',
      status: 'Tech design done · awaiting payment integration',
      statusKind: 'progress',
      deliverables: ['Technical design — done', 'Payment integration — pending'],
      links: [
        { label: 'Epic R4C-27223', url: 'https://roi4cio.atlassian.net/browse/R4C-27223' },
        { label: 'Design R4C-27369', url: 'https://roi4cio.atlassian.net/browse/R4C-27369' },
      ],
    },
  },
  {
    id: 9,
    tag: 'Initiative 7 · Coach Role',
    title: 'Coach Role',
    subtitle: 'Status: UI/UX prototype approval',
    script:
      'Coach Role is new and important functionality. We are currently at the final stage of UI/UX prototype approval with the team and stakeholders.',
    content: {
      kind: 'task',
      status: 'UI/UX prototype approval',
      statusKind: 'review',
      deliverables: ['UI/UX prototype — ready', 'Final approval with team and stakeholders'],
      links: [
        {
          label: 'Coach Module · UI/UX Overview',
          url: 'https://roi4cio.atlassian.net/wiki/spaces/pitchavatar/pages/1711407105/Coach+Module+UI+UX+Overview+Features+Settings+and+Evaluation+Process',
        },
      ],
    },
  },
  {
    id: 10,
    tag: 'Initiative 8 · Project Editing',
    title: 'Universal Project Editing',
    subtitle: 'Status: Prototype ready · design task in progress',
    script:
      'Coming up next — universal project editing with menu items. The prototype is already built, the design task is in progress.',
    content: {
      kind: 'task',
      status: 'Prototype ready · design in progress',
      statusKind: 'planned',
      deliverables: ['Prototype — built', 'Design task — in progress'],
      links: [
        {
          label: 'Prototype /editor',
          url: 'https://pitch-avatar-lab.vercel.app/editor?projectId=5cfb35e3-aa02-4cc9-8778-c0e93fd350d8',
        },
      ],
    },
  },
  {
    id: 11,
    tag: 'Approaches · Tools',
    title: 'My results and tools',
    subtitle: 'Achieving high efficiency',
    script:
      'My results were largely achieved through active use of advanced tools. I actively use Claude, voice dictation, screen recording, and Jira, which allows dramatically speeding up task definition, PRD creation, and artifact preparation.',
    content: {
      kind: 'list',
      items: ['Claude', 'Screen Recording', 'Jira', 'Voice dictation'],
    },
  },
  {
    id: 12,
    tag: 'Analysis · Processes',
    title: 'Current process analysis',
    subtitle: 'Speed and efficiency growth',
    script:
      'Process analysis showed multiple efficiency gains across all product management stages. Introducing new approaches and tools has radically reduced time-to-market for the design phase.',
    content: {
      kind: 'closing',
      points: [
        'Prototype and design creation speed increased',
        'Epic and story creation accelerated through LLM Skills',
        'A working site prototype is built alongside the presentation — this simplifies design review and logic understanding',
        'Requirements approval time reduced through artifact visibility',
      ],
    },
  },
  {
    id: 13,
    tag: 'Proposals',
    title: 'My proposals',
    subtitle: 'Ideas for workflow optimization',
    script:
      'I propose introducing regular technical design syncs before development starts, standardizing task handoffs in Jira, and leveraging AI more actively for initial requirements review. This will help shorten the feature delivery cycle and reduce the number of blockers.',
    content: {
      kind: 'list',
      items: ['Tech design syncs', 'Jira standards', 'AI requirements review'],
    },
  },
  {
    id: 14,
    tag: 'Summary · Next steps',
    title: 'Probation period summary',
    subtitle: 'Strong start and foundation for the future',
    script:
      'In summary: a solid foundation has been laid, key prototypes and PRDs created for critical features. Processes are running, tasks handed off or in final approval stages. Ready for new challenges!',
    content: {
      kind: 'closing',
      points: [
        'Foundation established',
        'Key features in progress',
        'Transition to scaling',
      ],
    },
  },
];
