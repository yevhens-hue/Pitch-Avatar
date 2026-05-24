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
    wizardStep?: number; // For step-specific triggers
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
  // Сценарий 1: Пользователь завис в редакторе (Таймаут / Idle)
  {
    id: 'idle_editor_script',
    triggerType: 'idle',
    routePattern: '^/create/video$',
    condition: {
      timeoutSeconds: 60,
    },
    content: {
      message: 'Не знаете, что написать на слайде? Я могу сгенерировать скрипт на основе вашего текста.',
      ctaLabel: 'Создать скрипт',
      action: {
        type: 'start_tour',
        tourId: 'tour_write_script',
      },
    },
    cooldownHours: 24,
  },
  // Сценарий 2: Превышение лимита символов (Ошибка / Error)
  {
    id: 'error_audio_quota',
    triggerType: 'error',
    routePattern: '.*', // Anywhere
    condition: {
      eventOrErrorMatch: 'quota_exceeded',
    },
    content: {
      message: 'Упс, кажется ваш текст превышает лимит. Хотите, я помогу сократить скрипт без потери смысла?',
      ctaLabel: 'Сократить текст',
      action: {
        type: 'open_chat',
        prefillMessage: 'Помоги мне сократить этот текст без потери смысла: ',
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
      message: 'Слайды успешно загружены! Самое время добавить к ним ведущего. Выбрать готовый аватар или загрузить ваше фото?',
      ctaLabel: 'Выбрать аватар',
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
      main_goal: 'localization',
    },
    content: {
      message: 'Готовы перевести видео? Давайте выберем целевой язык и подходящий голос.',
      ctaLabel: 'Выбрать язык',
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
      message: 'Роль выбрана отлично! Но чтобы я могла отвечать на вопросы ваших клиентов, мне нужна база знаний. Загрузите PDF или добавьте ссылку.',
      ctaLabel: 'Показать как загрузить',
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
      wizardStep: 2,
    },
    content: {
      message: 'Не знаете, какой файл презентации лучше загрузить? Я поддерживаю PDF и PPTX до 100 МБ.',
      ctaLabel: 'Узнать о форматах',
      action: {
        type: 'open_chat',
        prefillMessage: 'Расскажи подробнее про форматы файлов для презентации',
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
      wizardStep: 3,
    },
    content: {
      message: 'Напишем инструкцию для аватара вместе? Я могу составить готовый промпт под вашу роль.',
      ctaLabel: 'Составить промпт',
      action: {
        type: 'open_chat',
        prefillMessage: 'Помоги мне написать кастомные инструкции для моего аватара. Моя сфера бизнеса: ',
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
      wizardStep: 4,
    },
    content: {
      message: 'Добавьте базу знаний (PDF, ссылки или текст), чтобы ваш аватар мог точно отвечать на вопросы клиентов!',
      ctaLabel: 'Как настроить базу',
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
      message: 'Ваше видео готово и выглядит отлично! Хотите скопировать ссылку или отправить его на email?',
      ctaLabel: 'Поделиться видео',
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
      message: 'Заметила, что вы приостановились. Нужна помощь? Могу запустить обучающий тур или подробнее рассказать в чате!',
      ctaLabel: 'Запустить тур',
      action: {
        type: 'start_tour',
        tourId: 'tour_create_chat_avatar_1',
      },
    },
    cooldownHours: 2,
  },
];
