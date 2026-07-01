// Презентация по итогам всего испытательного срока в Pitch Avatar.
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
  done: 'Готово',
  progress: 'В работе',
  review: 'На согласовании',
  blocked: 'Заблокировано',
  planned: 'В планах',
};

export const probationSlides: ProbationSlide[] = [
  {
    id: 1,
    tag: 'Probation Review · Июнь 2026',
    title: 'Итоги испытательного срока в Pitch Avatar',
    subtitle: 'Что сделано, что в работе и что запланировано по продуктовым инициативам',
    script:
      'Добрый день! Подведу итоги всего испытательного срока. За этот период я провёл восемь продуктовых инициатив: часть уже доставлена и передана в разработку, часть находится в активной работе, ещё одна — в планах. По каждой есть PRD, эпик, дизайн-задачи и рабочие прототипы.',
    content: {
      kind: 'summary',
      metrics: [
        { label: 'Продуктовых инициатив', value: '8', accent: 'blue' },
        { label: 'Эпиков в Jira', value: '6', accent: 'blue' },
        { label: 'Рабочих прототипов', value: '5', accent: 'green' },
        { label: 'PRD / тех-дизайнов', value: '4', accent: 'amber' },
      ],
    },
  },
  {
    id: 2,
    tag: 'Обзор · Все инициативы',
    title: 'Карта инициатив и их статусы',
    subtitle: 'Сводная картина по всем направлениям',
    script:
      'Вот общая картина. Listeners CRUD передан в разработку. Templates, Sara, Enrollments и квоты — в активной работе. Billing временно заблокирован проблемами платёжки. Coach Role на согласовании UI/UX, а универсальный редактор проектов — в планах.',
    content: {
      kind: 'overview',
      items: [
        { name: 'Templates', status: 'progress' },
        { name: 'AI-ассистент Sara', status: 'progress' },
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
    tag: 'Инициатива 1 · Templates',
    title: 'Templates (Шаблоны)',
    subtitle: 'Статус: Сейчас в работе',
    script:
      'Первая ключевая задача — Шаблоны. Мы подготовили PRD, Эпик и стори под дизайн. Прототипы для клиентской части и рабочего пространства уже готовы. Дизайн также полностью завершён. Фича находится в активной разработке.',
    content: {
      kind: 'task',
      status: 'Сейчас в работе',
      statusKind: 'progress',
      deliverables: [
        'PRD и Эпик — готовы',
        'Стори под дизайн — готовы',
        'Прототипы: клиентская часть и рабочее пространство',
        'Дизайн — полностью завершён',
      ],
    },
  },
  {
    id: 4,
    tag: 'Инициатива 2 · Sara',
    title: 'AI-ассистент Sara',
    subtitle: 'Статус: Сейчас в работе · этап ресёрча',
    script:
      'Следующий важный блок — AI-ассистент Sara. Готово PRD, оформлен Эпик и собран рабочий прототип. Фичу я уже успешно презентовал. Сейчас мы находимся на этапе исследований и доработок.',
    content: {
      kind: 'task',
      status: 'Сейчас в работе · этап ресёрча',
      statusKind: 'progress',
      deliverables: [
        'PRD и Эпик — готовы',
        'Рабочий прототип — собран',
        'Фича презентована',
      ],
      links: [{ label: 'Эпик R4C-25315', url: 'https://roi4cio.atlassian.net/browse/R4C-25315' }],
    },
  },
  {
    id: 5,
    tag: 'Инициатива 3 · Billing',
    title: 'Billing Management',
    subtitle: 'Статус: Смещается из-за проблем с платёжкой',
    script:
      'Для управления биллингом готов Эпик и задача под дизайн. Также собран и протестирован прототип. Сроки немного смещаются из-за сложностей на стороне интеграции с платёжной системой.',
    content: {
      kind: 'task',
      status: 'Смещается из-за проблем с платёжкой',
      statusKind: 'blocked',
      deliverables: ['Эпик и задача под дизайн — готовы', 'Прототип — собран и протестирован'],
      links: [
        { label: 'Эпик R4C-26173', url: 'https://roi4cio.atlassian.net/browse/R4C-26173' },
        { label: 'Дизайн R4C-26207', url: 'https://roi4cio.atlassian.net/browse/R4C-26207' },
        { label: 'Прототип /settings', url: 'https://pitch-avatar-lab.vercel.app/settings' },
      ],
    },
  },
  {
    id: 6,
    tag: 'Инициатива 4 · Listeners',
    title: 'Listeners CRUD',
    subtitle: 'Статус: Передано в работу PM',
    script:
      'По функционалу управления слушателями (Listeners CRUD) работа завершена с моей стороны: готов Эпик, стори под дизайн и рабочий прототип. Задача полностью передана в работу Project Manager.',
    content: {
      kind: 'task',
      status: 'Передано в работу PM',
      statusKind: 'done',
      deliverables: ['Эпик и стори под дизайн — готовы', 'Рабочий прототип — готов', 'Передано в работу PM'],
      links: [
        { label: 'Эпик R4C-26431', url: 'https://roi4cio.atlassian.net/browse/R4C-26431' },
        { label: 'Прототип /listeners', url: 'https://pitch-avatar-lab.vercel.app/listeners' },
      ],
    },
  },
  {
    id: 7,
    tag: 'Инициатива 5 · Enrollments',
    title: 'Enrollments',
    subtitle: 'Статус: В работе · остался последний блок',
    script:
      'Мы продолжаем работу над Enrollments. Оформлена задача под дизайн, сейчас процесс находится в активной фазе — нам осталось завершить разработку последнего блока.',
    content: {
      kind: 'task',
      status: 'В работе · остался последний блок',
      statusKind: 'progress',
      deliverables: ['Задача под дизайн — оформлена', 'Прототип — готов', 'Разработка — в процессе'],
      links: [
        { label: 'Дизайн R4C-27073', url: 'https://roi4cio.atlassian.net/browse/R4C-27073' },
        { label: 'Прототип /enrollments', url: 'https://pitch-avatar-lab.vercel.app/enrollments' },
      ],
    },
  },
  {
    id: 8,
    tag: 'Инициатива 6 · Quota & Billing',
    title: 'Enrollments Quota & Billing',
    subtitle: 'Статус: Тех-дизайн готов · осталось подключение платёжки',
    script:
      'Связанная задача по настройке квот и биллингу Enrollments. Технический дизайн уже полностью готов. Ожидаем завершения работ по подключению платёжной системы для финального запуска.',
    content: {
      kind: 'task',
      status: 'Тех-дизайн готов · ожидание платёжки',
      statusKind: 'progress',
      deliverables: ['Технический дизайн — готов', 'Подключение платёжки — ожидается'],
      links: [
        { label: 'Эпик R4C-27223', url: 'https://roi4cio.atlassian.net/browse/R4C-27223' },
        { label: 'Дизайн R4C-27369', url: 'https://roi4cio.atlassian.net/browse/R4C-27369' },
      ],
    },
  },
  {
    id: 9,
    tag: 'Инициатива 7 · Coach Role',
    title: 'Coach Role',
    subtitle: 'Статус: Согласование UI/UX-прототипа',
    script:
      'Роль Коуча — новая и важная функциональность. На текущий момент мы находимся на этапе финального согласования UI/UX-прототипа с командой и стейкхолдерами.',
    content: {
      kind: 'task',
      status: 'Согласование UI/UX-прототипа',
      statusKind: 'review',
      deliverables: ['UI/UX-прототип — готов', 'Финальное согласование с командой и стейкхолдерами'],
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
    tag: 'Инициатива 8 · Project Editing',
    title: 'Universal Project Editing',
    subtitle: 'Статус: Прототип готов · задача на дизайн в процессе',
    script:
      'В ближайших планах — универсальное редактирование проектов с пунктами меню. Прототип уже собран, задача на дизайн находится в процессе работы.',
    content: {
      kind: 'task',
      status: 'Прототип готов · дизайн в работе',
      statusKind: 'planned',
      deliverables: ['Прототип — собран', 'Задача на дизайн — в работе'],
      links: [
        {
          label: 'Прототип /editor',
          url: 'https://pitch-avatar-lab.vercel.app/editor?projectId=5cfb35e3-aa02-4cc9-8778-c0e93fd350d8',
        },
      ],
    },
  },
  {
    id: 11,
    tag: 'Подходы · Инструменты',
    title: 'Свои результаты и инструменты',
    subtitle: 'Достижение высокой эффективности',
    script:
      'Мои результаты во многом достигнуты благодаря активному использованию передовых инструментов. Я активно использую Claude, голосовую диктовку, запись скринкастов и Jira, что позволяет кратно ускорить постановку задач, создание PRD и подготовку артефактов.',
    content: {
      kind: 'list',
      items: ['Claude', 'Screen Recording', 'Jira', 'Голосовая диктовка'],
    },
  },
  {
    id: 12,
    tag: 'Анализ · Процессы',
    title: 'Анализ текущих процессов',
    subtitle: 'Рост скорости и эффективности',
    script:
      'Анализ процессов показал кратный рост эффективности на всех этапах продакт-менеджмента. Внедрение новых подходов и инструментов радикально сократило время time-to-market для стадии проектирования.',
    content: {
      kind: 'closing',
      points: [
        'Выросла скорость создания прототипов и дизайнов',
        'Создание эпиков и сторей ускорилось за счёт Skills в LLM',
        'Вместе с презентацией собирается рабочий сайт-прототип — это упрощает дизайн и понимание логики',
        'Снизилось время на согласование требований за счёт наглядности артефактов',
      ],
    },
  },
  {
    id: 13,
    tag: 'Предложения',
    title: 'Мои предложения',
    subtitle: 'Идеи для оптимизации работы',
    script:
      'Предлагаю внедрить регулярные синки по техническому дизайну до старта разработки, стандартизировать передачу задач в Jira и активнее привлекать AI для первичного ревью требований. Это поможет сократить цикл доставки фичей и снизить количество блокеров.',
    content: {
      kind: 'list',
      items: ['Тех-дизайн синки', 'Стандарты Jira', 'AI-ревью требований'],
    },
  },
  {
    id: 14,
    tag: 'Итоги · Следующие шаги',
    title: 'Итоги испытательного срока',
    subtitle: 'Успешный старт и задел на будущее',
    script:
      'Подводя итог: заложен прочный фундамент, созданы ключевые прототипы и PRD для критически важных фичей. Процессы запущены, задачи переданы в работу или находятся на финальных этапах согласования. Готов к новым вызовам!',
    content: {
      kind: 'closing',
      points: [
        'Фундамент заложен',
        'Ключевые фичи в работе',
        'Переход к масштабированию',
      ],
    },
  },
];
