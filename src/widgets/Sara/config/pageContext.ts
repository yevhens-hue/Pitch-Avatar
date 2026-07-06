/**
 * Page Context Map (Sara AI Widget — Context-Awareness Layer)
 *
 * Each entry maps a URL pattern (regex string) to:
 *  - contextLabel: human-readable name shown in the widget header / passed to LLM
 *  - pageDescription: detailed text description of what the user can do on this page,
 *    injected into the LLM system prompt to reduce hallucinations and improve relevance.
 *
 * Order matters — first match wins. Put more specific patterns before generic ones.
 * Source: descriptions prepared by Nadiia (Product Team, 2026-06-26 meeting).
 */

export interface PageContextEntry {
  /** Human-readable label for the current section (used in widget UI & LLM prompt) */
  contextLabel: string;
  /** Detailed page description for LLM context injection */
  pageDescription: string;
}

interface PageContextPattern {
  pattern: RegExp;
  context: PageContextEntry;
}

const PAGE_CONTEXT_MAP: PageContextPattern[] = [
  // ── Dashboard / Home ─────────────────────────────────────────
  {
    pattern: /^\/dashboard(\/.*)?$/,
    context: {
      contextLabel: 'Dashboard',
      pageDescription:
        'The user is on the main Dashboard. Here they can see an overview of all their projects (presentations, chat avatars, video localizations), quick stats, and shortcuts to create new content. They can click "New Project" to start a presentation, "New Chat Avatar" to create an AI chat agent, or navigate to Analytics, Enrollments, and Settings.',
    },
  },

  // ── Chat Avatar — Create wizard ───────────────────────────────
  {
    pattern: /^\/chat-avatar\/create$/,
    context: {
      contextLabel: 'Chat Avatar Creator',
      pageDescription:
        'The user is in the Chat Avatar creation wizard. The wizard has 4 steps: Step 1 — Basic Setup (avatar name, language, voice, photo upload); Step 2 — Pitch Content (link an existing presentation or upload a new one); Step 3 — Avatar Instructions (select a role like Sales/HR/Demo, write a greeting message and custom instructions); Step 4 — Knowledge Base (upload PDFs, paste links, or enter text so the avatar can answer client questions). The user can go back and forward between steps.',
    },
  },

  // ── Chat Avatar — main list page ──────────────────────────────
  {
    pattern: /^\/chat-avatar(\/.*)?$/,
    context: {
      contextLabel: 'Chat Avatars',
      pageDescription:
        'The user is on the Chat Avatars page. They can see all their AI chat agents, view their status, edit settings, copy share links, or delete them. The "Create new" button opens the Chat Avatar creation wizard.',
    },
  },

  // ── Project Editor ────────────────────────────────────────────
  {
    pattern: /^\/create\/editor(\/.*)?$/,
    context: {
      contextLabel: 'Project Editor',
      pageDescription:
        'The user is in the Project Editor — a universal editing interface. The top menu adapts based on project type and shows: Slides (upload/replace presentation), Avatar (choose AI avatar, voice, language), Knowledge Base (add PDF/links/text for the avatar), Instructions (role, greeting, custom instructions), General Settings (project name, access control), Import (upload new video or presentation), Share/Assign (copy share link, assign to team). Changes are saved automatically.',
    },
  },

  // ── Video creation / Localization wizard ──────────────────────
  {
    pattern: /^\/create\/video$/,
    context: {
      contextLabel: 'Video Creator',
      pageDescription:
        'The user is in the Video Creator. They can create AI-voiced presentations or localize existing video into 30+ languages. The workflow: 1) Upload slides (PDF/PPTX) or select an existing presentation; 2) Write or edit the voiceover script per slide; 3) Choose an AI avatar and voice; 4) Generate the video. For localization: upload a source video, choose target language, select a voice, and start dubbing.',
    },
  },

  // ── Knowledge Base ─────────────────────────────────────────────
  {
    pattern: /^\/knowledge(\/.*)?$/,
    context: {
      contextLabel: 'Knowledge Base',
      pageDescription:
        'The user is on the Knowledge Base page. Here they can upload company documents (PDF, DOCX), add website URLs to scrape, or manually enter text blocks. This knowledge is used by AI chat avatars to answer visitor questions accurately. They can organize documents by project and delete outdated files.',
    },
  },

  // ── Roles ──────────────────────────────────────────────────────
  {
    pattern: /^\/roles(\/.*)?$/,
    context: {
      contextLabel: 'Avatar Roles',
      pageDescription:
        'The user is on the Roles page. Roles define the behavior profile for AI avatars: name, greeting message, custom instructions, and default responses. They can create a new role, edit existing ones, or delete unused roles. Roles can be applied to any Chat Avatar project.',
    },
  },

  // ── Analytics ──────────────────────────────────────────────────
  {
    pattern: /^\/analytics(\/.*)?$/,
    context: {
      contextLabel: 'Analytics',
      pageDescription:
        'The user is on the Analytics page. They can see engagement metrics for their presentations and chat avatars: views, average watch time, drop-off rate, chat interactions, lead contacts collected. Data can be filtered by project, date range, and shared as a report.',
    },
  },

  // ── Enrollments ────────────────────────────────────────────────
  {
    pattern: /^\/enrollments(\/.*)?$/,
    context: {
      contextLabel: 'Enrollments',
      pageDescription:
        'The user is on the Enrollments page. Enrollments are personalized viewer sessions. They can create enrollment links to track individual viewers, set quotas, assign to HR onboarding flows, and see which recipients opened and watched the content. Bulk enrollment via CSV is also available.',
    },
  },

  // ── Settings ───────────────────────────────────────────────────
  {
    pattern: /^\/settings(\/.*)?$/,
    context: {
      contextLabel: 'Settings',
      pageDescription:
        'The user is in Settings. Available sections: Profile (name, email, password, photo), Company (logo, brand colors), Billing (subscription plan, usage quota, invoices), Team (invite members, manage roles), Integrations (connect HubSpot, Zapier, Webhooks), Notifications (email/in-app alerts).',
    },
  },

  // ── Coach (Training simulator) ─────────────────────────────────
  {
    pattern: /^\/coach(\/.*)?$/,
    context: {
      contextLabel: 'Sales Coach',
      pageDescription:
        'The user is in the Sales Coach training simulator. They can practice objection handling and sales conversations by talking to an AI buyer avatar. The coach evaluates answers in real-time and provides a score. Sessions are organized by presentation decks (slide-by-slide scenarios). There are two modes: Practice (free conversation) and Train (structured Q&A with scoring).',
    },
  },

  // ── Onboarding ─────────────────────────────────────────────────
  {
    pattern: /^\/onboarding(\/.*)?$/,
    context: {
      contextLabel: 'Onboarding',
      pageDescription:
        'The user is in the onboarding flow. This is typically a new user going through initial setup steps: selecting their main goal (sales pitch, HR onboarding, product demo, video localization), connecting their first project, and watching a quick-start tutorial.',
    },
  },

  // ── Projects / Library ─────────────────────────────────────────
  {
    pattern: /^\/(projects|library)(\/.*)?$/,
    context: {
      contextLabel: 'Projects Library',
      pageDescription:
        'The user is on the Projects page (library of all projects). They can see all presentations, chat avatars, and video localizations. Cards show thumbnail, title, status, and last updated date. They can open a project to edit, share it via link, duplicate, move to a folder, or delete.',
    },
  },

  // ── Fallback ────────────────────────────────────────────────────
  {
    pattern: /.*/,
    context: {
      contextLabel: 'Pitch Avatar',
      pageDescription:
        'The user is in the Pitch Avatar web application — an AI-powered platform for creating personalized video presentations, AI chat avatars, and localizing video content into 30+ languages.',
    },
  },
];

/**
 * Returns the context label and page description for the given pathname.
 * Always returns a result (fallback is the last entry).
 */
export function getPageContext(pathname: string): PageContextEntry {
  const entry = PAGE_CONTEXT_MAP.find(({ pattern }) => pattern.test(pathname));
  // fallback is guaranteed by the last entry with /.*/ pattern
  return entry!.context;
}
