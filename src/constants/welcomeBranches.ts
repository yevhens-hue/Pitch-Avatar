// ── Personalized Welcome Guide branches ──
// Each branch maps to a main_goal value collected at registration.

export type MainGoal =
  | 'create_ai_avatar_for_corporate_learning_and_communications'
  | 'create_a_short_video_with_ai_avatar'
  | 'build_conversational_avatar_for_customer_support'
  | 'get_chat_avatar_for_lead_generation_on_website_or_in_emails'
  | 'add_voiceover_and_or_ai_avatar_to_my_slides'
  | 'dub_or_translate_my_video'
  | 'i_am_just_playing_around'
  | 'other'

// Placeholder video — replace per branch once real videos are recorded
const PLACEHOLDER_VIDEO = 'https://www.youtube.com/watch?v=OKzPnlCteX4'

export interface BranchStep {
  title: string
  body: string
  video: string
}

export interface Branch {
  id: MainGoal | 'exploring'
  mainGoals: (MainGoal | null)[]
  headline: string
  steps: BranchStep[]
  ctaLabel: string
  activationRoute: string
}

export const WELCOME_BRANCHES: Branch[] = [
  {
    id: 'create_ai_avatar_for_corporate_learning_and_communications',
    mainGoals: ['create_ai_avatar_for_corporate_learning_and_communications'],
    headline: 'Create training videos your team will actually watch',
    steps: [
      {
        title: 'Choose your corporate avatar',
        body: 'Pick a professional look or upload your own photo — this will represent your brand.',
        video: PLACEHOLDER_VIDEO,
      },
      {
        title: 'Write your training script',
        body: 'Type your content or let AI draft it in any language your team speaks.',
        video: PLACEHOLDER_VIDEO,
      },
      {
        title: 'Generate & share with your team',
        body: 'One link — everyone watches on any device.',
        video: PLACEHOLDER_VIDEO,
      },
    ],
    ctaLabel: 'Create my first training video →',
    activationRoute: '/create/quick',
  },
  {
    id: 'create_a_short_video_with_ai_avatar',
    mainGoals: ['create_a_short_video_with_ai_avatar'],
    headline: 'Create your first AI video in under 2 minutes',
    steps: [
      {
        title: 'Choose or create your avatar',
        body: 'Upload your photo or pick a ready-made one.',
        video: PLACEHOLDER_VIDEO,
      },
      {
        title: 'Write or generate your script',
        body: 'Type what you want your avatar to say or let AI write it.',
        video: PLACEHOLDER_VIDEO,
      },
      {
        title: 'Add voice & export',
        body: 'Choose a voice, hit Generate — your video is ready.',
        video: PLACEHOLDER_VIDEO,
      },
    ],
    ctaLabel: 'Generate my first video →',
    activationRoute: '/create/quick',
  },
  {
    id: 'build_conversational_avatar_for_customer_support',
    mainGoals: ['build_conversational_avatar_for_customer_support'],
    headline: 'Create an avatar that talks to your customers',
    steps: [
      {
        title: 'Create your chat avatar',
        body: 'Choose look and voice — this is the face your customers will see.',
        video: PLACEHOLDER_VIDEO,
      },
      {
        title: 'Set up the conversation',
        body: 'Define what your avatar knows and how it responds.',
        video: PLACEHOLDER_VIDEO,
      },
      {
        title: 'Share the link',
        body: "Copy your avatar's link and send it to a customer.",
        video: PLACEHOLDER_VIDEO,
      },
    ],
    ctaLabel: 'Share link →',
    activationRoute: '/chat-avatar/create',
  },
  {
    id: 'get_chat_avatar_for_lead_generation_on_website_or_in_emails',
    mainGoals: ['get_chat_avatar_for_lead_generation_on_website_or_in_emails'],
    headline: 'Add an avatar to your website or email',
    steps: [
      {
        title: 'Create your chat avatar',
        body: 'Set up appearance and opening message — what will visitors see first?',
        video: PLACEHOLDER_VIDEO,
      },
      {
        title: 'Get your embed code',
        body: 'Copy the widget code — one paste and it\u2019s live.',
        video: PLACEHOLDER_VIDEO,
      },
      {
        title: 'Embed on site or in email',
        body: 'Paste it in. Your avatar is now working for you.',
        video: PLACEHOLDER_VIDEO,
      },
    ],
    ctaLabel: 'Copy & embed →',
    activationRoute: '/chat-avatar/create',
  },
  {
    id: 'add_voiceover_and_or_ai_avatar_to_my_slides',
    mainGoals: ['add_voiceover_and_or_ai_avatar_to_my_slides'],
    headline: 'Bring your presentation to life',
    steps: [
      {
        title: 'Upload your presentation',
        body: 'PowerPoint or PDF both work.',
        video: PLACEHOLDER_VIDEO,
      },
      {
        title: 'Add avatar & choose voice',
        body: 'Pick who presents your slides and in what voice.',
        video: PLACEHOLDER_VIDEO,
      },
      {
        title: 'Export or share',
        body: 'Send a link or download — your presentation now speaks for itself.',
        video: PLACEHOLDER_VIDEO,
      },
    ],
    ctaLabel: 'Share my presentation →',
    activationRoute: '/create/quick',
  },
  {
    id: 'dub_or_translate_my_video',
    mainGoals: ['dub_or_translate_my_video'],
    headline: 'Translate your video into another language',
    steps: [
      {
        title: 'Upload your video',
        body: 'Drop in your original video file. Most formats supported.',
        video: PLACEHOLDER_VIDEO,
      },
      {
        title: 'Choose the target language',
        body: '29+ languages available.',
        video: PLACEHOLDER_VIDEO,
      },
      {
        title: 'Export localized video',
        body: 'Your translated video is ready — download or share the link.',
        video: PLACEHOLDER_VIDEO,
      },
    ],
    ctaLabel: 'Export localization →',
    activationRoute: '/create/video',
  },
]

export const FALLBACK_BRANCH: Branch = {
  id: 'exploring',
  mainGoals: ['i_am_just_playing_around', 'other', null],
  headline: "Let's show you what's possible",
  steps: [
    {
      title: 'Create an avatar video',
      body: 'Takes 2 minutes. The quickest way to feel the product.',
      video: PLACEHOLDER_VIDEO,
    },
    {
      title: 'Translate a video',
      body: 'Upload any video and switch the language. Great to show a colleague.',
      video: PLACEHOLDER_VIDEO,
    },
    {
      title: 'Add avatar to a presentation',
      body: 'Drop in your slides — avatar does the talking.',
      video: PLACEHOLDER_VIDEO,
    },
  ],
  ctaLabel: 'Try any scenario →',
  activationRoute: '/',
}

export const ALL_BRANCHES: Branch[] = [...WELCOME_BRANCHES, FALLBACK_BRANCH]

export function getBranchByMainGoal(goal: string | null | undefined): Branch {
  if (!goal) return FALLBACK_BRANCH
  const found = WELCOME_BRANCHES.find(b => b.mainGoals.includes(goal as MainGoal))
  return found ?? FALLBACK_BRANCH
}

/** Simple analytics helper — swap body for real SDK calls */
export function trackGuideEvent(
  name: string,
  params: Record<string, string | number | null | undefined>,
): void {
  if (typeof window === 'undefined') return
  // eslint-disable-next-line no-console
  console.log(`[WelcomeGuide] ${name}`, params)
  // TODO: window.analytics?.track(name, params)
}
