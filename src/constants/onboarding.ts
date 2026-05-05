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
    { id: 0, title: 'Создай своего аватара', desc: 'Загрузи фото или выбери готового', path: '/editor', target: 'body', position: 'bottom' },
    { id: 1, title: 'Напиши или сгенерируй скрипт', desc: 'Введи текст или попроси AI', path: '/create/video', target: 'body', position: 'bottom' },
    { id: 2, title: 'Выбери голос', desc: 'Подбери голос для аватара', path: '/voices', target: 'body', position: 'bottom' },
    { id: 3, title: 'Сгенерируй видео', desc: 'Нажми Generate и подожди результат', path: '/create/video', target: 'body', position: 'bottom' },
    { id: 4, title: 'Поделись видео', desc: 'Скопируй ссылку или скачай файл', path: '/links', target: 'body', position: 'bottom' },
  ],
  chat: [
    { id: 0, title: 'Создай chat-аватара', desc: 'Выбери внешность и голос', path: '/chat-avatar/create', target: 'body', position: 'bottom' },
    { id: 1, title: 'Настрой сценарий разговора', desc: 'Задай что знает и как отвечает аватар', path: '/chat-avatar/create', target: 'body', position: 'bottom' },
    { id: 2, title: 'Протестируй аватара', desc: 'Проведи тестовый диалог', path: '/chat-avatar', target: 'body', position: 'bottom' },
    { id: 3, title: 'Получи ссылку или код embed', desc: 'Скопируй для сайта или email', path: '/links', target: 'body', position: 'bottom' },
    { id: 4, title: 'Поделись с первым пользователем', desc: 'Отправь ссылку — запусти первую сессию', path: '/links', target: 'body', position: 'bottom' },
  ],
  slides: [
    { id: 0, title: 'Загрузи презентацию', desc: 'PowerPoint или PDF', path: '/create', target: 'body', position: 'bottom' },
    { id: 1, title: 'Выбери аватара', desc: 'Кто будет презентовать слайды', path: '/editor', target: 'body', position: 'bottom' },
    { id: 2, title: 'Выбери голос (слайды)', desc: 'Подбери озвучку', path: '/voices', target: 'body', position: 'bottom' },
    { id: 3, title: 'Сгенерируй презентацию', desc: 'Нажми Generate', path: '/create/quick', target: 'body', position: 'bottom' },
    { id: 4, title: 'Поделись результатом', desc: 'Отправь ссылку или скачай', path: '/links', target: 'body', position: 'bottom' },
  ],
  localization: [
    { id: 0, title: 'Загрузи видео', desc: 'Любой формат, до 5 мин', path: '/video', target: 'body', position: 'bottom' },
    { id: 1, title: 'Выбери язык перевода', desc: 'Выберите целевой язык', path: '/video', target: 'body', position: 'bottom' },
    { id: 2, title: 'Запусти локализацию', desc: 'Нажми Start Processing', path: '/video', target: 'body', position: 'bottom' },
    { id: 3, title: 'Проверь результат', desc: 'Предпросмотр перевода', path: '/video', target: 'body', position: 'bottom' },
    { id: 4, title: 'Скачай или поделись', desc: 'Экспорт готового видео', path: '/video', target: 'body', position: 'bottom' },
  ],
  fallback: [
    { id: 0, title: 'Создай первое видео', desc: 'Занимает 2 минуты', path: '/create/video', target: 'body', position: 'bottom' },
    { id: 1, title: 'Переведи любое видео', desc: 'Загрузи и смени язык', path: '/video', target: 'body', position: 'bottom' },
    { id: 2, title: 'Добавь аватара к слайдам', desc: 'Загрузи свою презентацию', path: '/create', target: 'body', position: 'bottom' },
    { id: 3, title: 'Поделись результатом', desc: 'Отправь ссылку кому угодно', path: '/links', target: 'body', position: 'bottom' },
    { id: 4, title: 'Попробуй чат-аватара', desc: 'Запусти первый диалог', path: '/chat-avatar/create', target: 'body', position: 'bottom' },
  ]
};

// Legacy single checklist export to prevent instant build breaks in ChecklistWidget.tsx
export const ONBOARDING_STEPS = ONBOARDING_CHECKLISTS.video;
