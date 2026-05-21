import { TourId } from './tours';

export type TriggerType = 'idle' | 'error' | 'success' | 'entry';

export interface ProactiveConfig {
  id: string;
  triggerType: TriggerType;
  routePattern: string; // Regex string for matching pathname
  condition?: {
    main_goal?: string; // e.g. 'sales_demo'
    timeoutSeconds?: number; // For 'idle' trigger
    eventOrErrorMatch?: string; // For 'error' or 'success' trigger match string
  };
  content: {
    message: string;
    ctaLabel: string;
    action: {
      type: 'start_tour' | 'open_chat';
      tourId?: TourId;
      prefillMessage?: string;
    };
  };
  cooldownHours: number; // Prevent spamming same trigger
}

export const PROACTIVE_SCENARIOS: ProactiveConfig[] = [
  // Use Case 1: Idle in editor
  {
    id: 'idle_editor_script',
    triggerType: 'idle',
    routePattern: '^/create/video$',
    condition: {
      timeoutSeconds: 60,
    },
    content: {
      message: 'Not sure what to write on this slide? I can generate a script based on your text.',
      ctaLabel: 'Generate script',
      action: {
        type: 'start_tour',
        tourId: 'tour_write_script',
      },
    },
    cooldownHours: 24,
  },
  // Use Case 2: Audio generation error
  {
    id: 'error_audio_quota',
    triggerType: 'error',
    routePattern: '.*', // Anywhere
    condition: {
      eventOrErrorMatch: 'quota_exceeded',
    },
    content: {
      message: 'Oops, it seems your text exceeds the minutes limit. Want me to help shorten the script?',
      ctaLabel: 'Shorten script',
      action: {
        type: 'open_chat',
        prefillMessage: 'Help me shorten this text: ',
      },
    },
    cooldownHours: 1, // Let them retry sooner
  },
  // Use Case 3: Success presentation upload
  {
    id: 'success_slides_loaded',
    triggerType: 'success',
    routePattern: '^/create/.*$',
    condition: {
      eventOrErrorMatch: 'Slides_Loaded',
    },
    content: {
      message: 'Slides successfully loaded! Time to add a presenter. Choose a ready-made avatar or upload a photo?',
      ctaLabel: 'Choose avatar',
      action: {
        type: 'start_tour',
        tourId: 'tour_create_avatar',
      },
    },
    cooldownHours: 24,
  },
  // Use Case 4: Entry with localization goal
  {
    id: 'entry_localization',
    triggerType: 'entry',
    routePattern: '^/create/video$',
    condition: {
      main_goal: 'localization',
    },
    content: {
      message: "Ready to translate your video? Let's choose the target language and voice.",
      ctaLabel: 'Choose language',
      action: {
        type: 'start_tour',
        tourId: 'tour_choose_language',
      },
    },
    cooldownHours: 24,
  },
  // Use Case 5: Chat avatar instructions
  {
    id: 'idle_chat_kb',
    triggerType: 'idle',
    routePattern: '^/chat-avatar', // matches /chat-avatar and /chat-avatar/create
    condition: {
      timeoutSeconds: 60,
    },
    content: {
      message: 'Role selected perfectly! But to answer questions, I need a knowledge base. Upload a PDF or add a link.',
      ctaLabel: 'Show how to upload',
      action: {
        type: 'start_tour',
        // Note: Using an existing tour for illustration
        tourId: 'tour_create_chat_avatar_3',
      },
    },
    cooldownHours: 24,
  },
  // Use Case 6: Video generation complete
  {
    id: 'success_video_rendered',
    triggerType: 'success',
    routePattern: '.*',
    condition: {
      eventOrErrorMatch: 'video_rendered',
    },
    content: {
      message: 'Your video is ready and looks great! Want to copy the link or send it via email?',
      ctaLabel: 'Share video',
      action: {
        type: 'start_tour',
        tourId: 'tour_share_video',
      },
    },
    cooldownHours: 1,
  },
];
