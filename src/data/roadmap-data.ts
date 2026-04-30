export interface SlideData {
  id: number;
  tag: string;
  title: string;
  subtitle?: string;
  script: string;
  content: any; // Simplified for this implementation
}

export const roadmapSlides: SlideData[] = [
  {
    id: 1,
    tag: "CEO Update · Апрель 2026",
    title: "Первый месяц в Pitch Avatar: Идем по плану",
    subtitle: "Отчет по онбординг-плану и приоритеты на Месяц 2 и 3",
    script: "Приветствую! Сегодня я представлю отчет по первому месяцу моей работы в Pitch Avatar. Мы идем четко по графику: план онбординга выполнен на 65%, а песочница для экспериментов готова на 75%.",
    content: {
      metrics: [
        { label: "Онбординг", value: 65 },
        { label: "Sandbox", value: 75 },
        { label: "Research", value: 40 }
      ]
    }
  },
  {
    id: 2,
    tag: "Слайд 2 · Анализ рынка",
    title: "Анализ лидеров рынка и онбординга конкурентов",
    script: "Мы провели глубокий анализ конкурентов, таких как HeyGen и Synthesia. Наша уникальная ценность — интерактивность. Мы стремимся сократить путь к Aha!-моменту, сделав его доступным уже на этапе превью аватара.",
    content: {
      benchmarks: ["Aha! Moment: цель — Preview", "HeyGen: Speed-to-Value", "Success Checklists"]
    }
  },
  {
    id: 3,
    tag: "Слайд 3 · Исходные данные",
    title: "Данные PostHog за последние 30 дней",
    script: "Цифры показывают, что нам есть над чем работать. Конверсия в оплату сейчас составляет 1.38% — это красная зона. Основной отвал происходит на втором шаге воронки создания аватара, где мы теряем до 35% пользователей.",
    content: {
      metrics: [
        { label: "Trial → Paid", value: "1.38%", status: "red" },
        { label: "Retention W1", value: "2.2%", status: "red" },
        { label: "Avatar Drop", value: "59%", status: "amber" }
      ]
    }
  },
  {
    id: 4,
    tag: "Слайд 4 · Проделанная работа",
    title: "Стратегические артефакты: фундамент PM-процесса",
    script: "Мы выстроили фундамент: визуализировали CJM, декомпозировали бэклог через User Story Map и создали дерево метрик. Теперь каждое изменение в продукте обосновано данными и привязано к LTV.",
    content: {
      artifacts: ["Customer Journey Map", "User Story Map", "Metric Map"]
    }
  },
  {
    id: 5,
    tag: "Слайд 5 · Решение. Activation / Conversion",
    title: "Повышение Activation: Онбординг 2.0",
    script: "Наше решение — внедрение JTBD-сценариев и ИИ-ассистента Сары. Мы уже работаем над 5 сценариями, которые будут вести пользователя за руку к его первой интерактивной презентации.",
    content: {
      targets: ["-15-20% drop-off на Step 2", "Sara AI integration", "JTBD Scenarios"]
    }
  },
  {
    id: 6,
    tag: "Слайд 6 · Sandbox",
    title: "Sandbox и быстрое прототипирование",
    script: "Для скорости мы используем Sandbox на Vercel. Это позволяет нам тестировать гипотезы и новые воронки за часы, а не недели, не рискуя стабильностью основного продукта.",
    content: {
      features: ["Full UI copy", "Sara AI Prototype", "PostHog tracking"]
    }
  },
  {
    id: 7,
    tag: "Слайд 7 · Sara в действии",
    title: "Sara: контекстная помощь в критический момент",
    script: "Сара — это наш секретный агент по удержанию. Она активируется именно в момент отвала на втором шаге и помогает пользователю голосом, снижая когнитивную нагрузку.",
    content: {
      features: ["Voice TTS", "Context Aware", "Drag & Move"]
    }
  },
  {
    id: 8,
    tag: "Слайд 8 · Аналитика и трекинг",
    title: "PostHog: событийная аналитика настроена",
    script: "Теперь мы видим всё. Каждый вопрос к аватару, каждый клик по подсказке Сары фиксируется в PostHog. Это база для проведения A/B тестов, которые мы начнем в ближайшее время.",
    content: {
      events: ["chat_avatar_rendered", "sara_chip_clicked", "wizard_step_completed"]
    }
  },
  {
    id: 9,
    tag: "Слайд 9 · Research",
    title: "Анализ поведения и JTBD Интервью",
    script: "Во втором месяце фокус сместится на качественные исследования. Я проведу 7 глубинных JTBD интервью, чтобы понять, почему пользователи не возвращаются после первой сессии.",
    content: {
      research: ["7 JTBD Interviews", "Hotjar Heatmaps", "Cohort Analysis"]
    }
  },
  {
    id: 10,
    tag: "Слайд 10 · Стратегия Retention & Growth Loops",
    title: "Growth Loops: от инструмента к системе роста",
    script: "Мы строим систему роста. Социальные петли внутри команд и виральный эффект от брендированного плеера позволят нам расти органически с минимальными затратами на маркетинг.",
    content: {
      loops: ["Social Loops", "Virality", "Retention Focus"]
    }
  },
  {
    id: 11,
    tag: "Слайд 11 · Роудмап",
    title: "Бизнес-роудмап: Месяц 2 и 3",
    script: "Вот наш план на май и июнь. В мае фокусируемся на активации и шаблонах, а в июне — на A/B тестировании Сары и удержании в сегменте HR Learning.",
    content: {
      milestones: ["Interactive Tours", "7 Templates", "Sara A/B Test"]
    }
  },
  {
    id: 12,
    tag: "Слайд 12 · Итоги и план",
    title: "Краткая выжимка и главный KPI",
    script: "Подводя итог: фундамент заложен, аналитика настроена, прототипы в работе. Наш главный KPI — улучшение метрик активации. Спасибо! Готов ответить на ваши вопросы.",
    content: {
      kpi: "Improve activation metrics by end of probation"
    }
  }
];
