import { TourId } from './tours';

export type TriggerType = 'idle' | 'error' | 'success' | 'entry';

export interface ProactiveConfig {
  id: string;
  triggerType: TriggerType;
  routePattern: string; // Regex string for matching pathname
  condition?: {
    timeoutSeconds?: number; // For 'idle' trigger
    eventOrErrorMatch?: string; // For 'error' or 'success' trigger match string
    contextMatch?: Record<string, any>; // Generic matching against hostContext
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
  // Сценарий 0: Создан первый проект (Универсальный Inbound пример)
  {
    id: 'first_project_welcome',
    triggerType: 'entry',
    routePattern: '.*', // Anywhere
    condition: {
      contextMatch: { FIRST_PROJECT: true },
    },
    content: {
      message: 'Congratulations on creating your first project! Want to watch a short video on how to get started?',
      ctaLabel: 'Watch video',
      action: {
        type: 'start_tour',
        tourId: 'tour_create_avatar',
      },
    },
    cooldownHours: 24,
  },
  // Сценарий 1: Пользователь завис в редакторе (Таймаут / Idle)
  {
    id: 'idle_editor_script',
    triggerType: 'idle',
    routePattern: '^/create/video$',
    condition: {
      timeoutSeconds: 60,
    },
    content: {
      message: 'Don't know what to write on the slide? I can generate a script based on your text.',
      ctaLabel: 'Create script',
      action: {
        type: 'start_tour',
        tourId: 'tour_write_script',
      },
    },
    cooldownHours: 24,
  },
  // Сценарий 2: Превышение лимита символов (Error / Error)
  {
    id: 'error_audio_quota',
    triggerType: 'error',
    routePattern: '.*', // Anywhere
    condition: {
      eventOrErrorMatch: 'quota_exceeded',
    },
    content: {
      message: 'Oops, your text seems to exceed the limit. Want me to help shorten the script without losing meaning?',
      ctaLabel: 'Shorten text',
      action: {
        type: 'open_chat',
        prefillMessage: 'Help me shorten this text without losing meaning: ',
      },
    },
    cooldownHours: 1, // Let them retry sooner
  },
  // Сценарий 3: Успешная загрузка слайдов (Успех / Success)
  {
    id: 'success_slides_loaded',
    triggerType: 'success',
    routePattern: '^/create/.*$',
    condition: {
      eventOrErrorMatch: 'Slides_Loaded',
    },
    content: {
      message: 'Slides uploaded successfully! Now is a great time to add a presenter. Choose a ready avatar or upload your photo?',
      ctaLabel: 'Choose avatar',
      action: {
        type: 'start_tour',
        tourId: 'tour_create_avatar',
      },
    },
    cooldownHours: 24,
  },
  // Сценарий 4: Вход с целью локализации (Контекст / Entry)
  {
    id: 'entry_localization',
    triggerType: 'entry',
    routePattern: '^/create/video$',
    condition: {
      contextMatch: { main_goal: 'localization' },
    },
    content: {
      message: 'Ready to translate your video? Let's choose the target language and a suitable voice.',
      ctaLabel: 'Choose language',
      action: {
        type: 'start_tour',
        tourId: 'tour_choose_language',
      },
    },
    cooldownHours: 24,
  },
  // Сценарий 5: Обучение Chat-аватара (Таймаут / Idle)
  {
    id: 'idle_chat_kb',
    triggerType: 'idle',
    routePattern: '^/chat-avatar$', // matches /chat-avatar only (not /chat-avatar/create)
    condition: {
      timeoutSeconds: 60,
    },
    content: {
      message: 'Great role choice! But to answer your customers' questions, I need a knowledge base. Upload a PDF or add a link.',
      ctaLabel: 'Show me how to upload',
      action: {
        type: 'start_tour',
        // Note: Using an existing tour for illustration
        tourId: 'tour_create_chat_avatar_3',
      },
    },
    cooldownHours: 24,
  },
  // Сценарий 5.2: Presentation Content (Крок 2 візарда)
  {
    id: 'idle_creator_step2_content',
    triggerType: 'idle',
    routePattern: '^/chat-avatar/create$',
    condition: {
      timeoutSeconds: 30,
      contextMatch: { wizardStep: 2 },
    },
    content: {
      message: 'Don't know which presentation file to upload? I support PDF and PPTX up to 100 MB.',
      ctaLabel: 'Learn about formats',
      action: {
        type: 'open_chat',
        prefillMessage: 'Tell me more about presentation file formats',
      },
    },
    cooldownHours: 2,
  },
  // Сценарий 5.3: Avatar Instructions (Крок 3 візарда)
  {
    id: 'idle_creator_step3_instructions',
    triggerType: 'idle',
    routePattern: '^/chat-avatar/create$',
    condition: {
      timeoutSeconds: 30,
      contextMatch: { wizardStep: 3 },
    },
    content: {
      message: 'Let's write avatar instructions together. I can create a ready-made prompt for your role.',
      ctaLabel: 'Create prompt',
      action: {
        type: 'open_chat',
        prefillMessage: 'Help me write custom instructions for my avatar. My business area: ',
      },
    },
    cooldownHours: 2,
  },
  // Сценарий 5.4: Knowledge Base (Крок 4 візарда)
  {
    id: 'idle_creator_step4_kb',
    triggerType: 'idle',
    routePattern: '^/chat-avatar/create$',
    condition: {
      timeoutSeconds: 30,
      contextMatch: { wizardStep: 4 },
    },
    content: {
      message: 'Add a knowledge base (PDF, links, or text) so your avatar can accurately answer customer questions!',
      ctaLabel: 'How to set up knowledge base',
      action: {
        type: 'start_tour',
        tourId: 'tour_create_chat_avatar_3',
      },
    },
    cooldownHours: 2,
  },
  // Сценарий 6: Успешная генерация видео (Успех / Success)
  {
    id: 'success_video_rendered',
    triggerType: 'success',
    routePattern: '.*',
    condition: {
      eventOrErrorMatch: 'video_rendered',
    },
    content: {
      message: 'Your video is ready and looks great! Want to copy the link or send it by email?',
      ctaLabel: 'Share video',
      action: {
        type: 'start_tour',
        tourId: 'tour_share_video',
      },
    },
    cooldownHours: 1,
  },
  // Use Case 7: General idle help on any screen
  {
    id: 'idle_general_help',
    triggerType: 'idle',
    routePattern: '.*',
    condition: {
      timeoutSeconds: 30,
    },
    content: {
      message: 'I noticed you paused. Need help? I can start a tutorial tour or tell you more in the chat!',
      ctaLabel: 'Start tour',
      action: {
        type: 'start_tour',
        tourId: 'tour_create_chat_avatar_1',
      },
    },
    cooldownHours: 2,
  },
];
