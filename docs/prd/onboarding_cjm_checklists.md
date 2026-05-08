# [TASK] Design of Personalized Onboarding Checklists & CJM Integration

| Metric | Details |
| :--- | :--- |
| **Author** | yevhen.shaforostov |
| **Status** | 🟢 Approved / В работе |
| **Date** | May 4, 2026 |
| **Miro Reference** | [CJM Chat-Avatar Board](https://miro.com/app/board/uXjVGoZkKFM=/?moveToWidget=3458764670331285817) |

---

## 🎯 Goal
Спроектировать логику персонализированных чеклистов онбординга под различные сценарии использования (Use Cases) Pitch Avatar, а также провести аудит и адаптацию существующих интерактивных гайдов для их интеграции прямо внутрь продукта. 

**Ключевой результат:** Бесшовный переход от ознакомительного Welcome-гайда (Stonly) к практическим действиям в интерфейсе через чеклисты и интерактивные туры (Guideglow).

---

## 📋 What needs to be done

### 1. Аудит Stonly (Инвентаризация)
*   Выгрузить список всех активных тур-гайдов и сценариев из Stonly.
*   Зафиксировать метрики (какие гайды дочитывают до конца, где самый большой процент отвалов).
*   Принять решение по каждому гайду: переносить "как есть", переписывать под новый UI или удалять.

### 2. Создание матрицы Use Cases & CJM
*   Спроектировать CJM для 5 ключевых веток онбординга (на основе Miro):
    1. **B2 Short Video** (Видео с аватаром)
    2. **B1/B3/B4 Use Cases** (Chat-аватар)
    3. **B5 Slides** (Слайды)
    4. **B6 Localization** (Локализация)
    5. **B7 Fallback** (Общий старт)
*   Составить таблицу соответствия между `main_goal` пользователя (из первого этапа онбординга) и выбором конкретной ветки чеклиста.

### 3. Рерайтинг и адаптация контента
*   Переработать длинные тексты из Stonly в лаконичный микрокопирайтинг для in-app чеклистов.
*   Сформулировать пункты в императиве (напр., "Создай", "Напиши", "Выбери"), чтобы подчеркнуть переход от "посмотри" (гайд) к "сделай" (чеклист).
*   Обновить медиафайлы и скриншоты под актуальный UI.

### 4. UX Логика и Ветвление
*   Описать логику появления чеклиста (bottom-right) после завершения Welcome-гайда.
*   Учесть динамическое заполнение: если действие CTA из гайда уже привело к первому шагу, Пункт 1 в чеклисте должен быть автоматически отмечен как ☑.
*   Описать систему бонусов (напр., "+5 минут аватара") за полное выполнение чеклиста.

---

## 🛠 Схемы Чеклистов (Матрица и Сценарии)

### Матрица веток (Use Cases)
| # | Версия чеклиста (Ветка) | Сценарий | Activation Event (Target) |
| :--- | :--- | :--- | :--- |
| 1 | **Видео с аватаром** | B2 Short Video | Video exported |
| 2 | **Chat-аватар** | B1 Corporate Learning + B3 Customer Support + B4 Lead Gen | External session started |
| 3 | **Слайды** | B5 | Presentation exported or shared |
| 4 | **Локализация** | B6 | Video exported |
| 5 | **Общий старт** | B7 (Fallback) | Any key action |

### Чеклист 1 — Видео с аватаром (B2)
| Пункт | Действие |
| :--- | :--- |
| 1. Создай своего аватара | Загрузи фото или выбери готового |
| 2. Напиши или сгенерируй скрипт | Введи текст или попроси AI |
| 3. Выбери голос | Подбери голос для аватара |
| 4. Сгенерируй видео | Нажми Generate и подожди результат |
| 5. Поделись видео | Скопируй ссылку или скачай файл |
*★ Бонус разблокирован! +5 минут аватара*

### Чеклист 2 — Chat-аватар (B1/B3/B4)
| Пункт | Действие |
| :--- | :--- |
| 1. Создай chat-аватара | Выбери внешность и голос |
| 2. Настрой сценарий разговора | Задай что знает и как отвечает аватар |
| 3. Протестируй аватара | Проведи тестовый диалог |
| 4. Получи ссылку или код embed | Скопируй для сайта или email |
| 5. Поделись с первым пользователем | Отправь ссылку — запусти первую сессию |
*★ Бонус разблокирован! +5 минут аватара*

### Чеклист 3 — Слайды (B5)
| Пункт | Действие |
| :--- | :--- |
| 1. Загрузи презентацию | PowerPoint или PDF |
| 2. Выбери аватара | Кто будет презентовать твои слайды |
| 3. Выбери голос | Подбери голос для озвучки |
| 4. Сгенерируй презентацию с аватаром | Нажми Generate |
| 5. Поделись или скачай | Отправь ссылку или скачай файл |
*★ Бонус разблокирован! +5 минут аватара*

### Чеклист 4 — Локализация (B6)
| Пункт | Действие |
| :--- | :--- |
| 1. Загрузи видео | Любой формат, до X минут |
| 2. Выбери язык перевода | |
| 3. Запусти локализацию | Нажми Generate |
| 4. Проверь результат | Посмотри превью переведённого видео |
| 5. Скачай или поделись | Экспортируй локализованное видео |
*★ Бонус разблокирован! +5 минут аватара*

### Чеклист 5 — Общий старт (B7 Fallback)
| Пункт | Действие |
| :--- | :--- |
| 1. Создай первое видео с аватаром | Займёт 2 минуты |
| 2. Переведи любое видео | Загрузи и смени язык |
| 3. Добавь аватара к презентации | Загрузи слайды |
| 4. Поделись результатом | Отправь ссылку кому угодно |
| 5. Попробуй chat-аватара | Запусти первый диалог |
*★ Бонус разблокирован! +5 минут аватара*

> **Итого:** нужно записать и озвучить уникальных туров: 15. Чеклист 5 полностью собирается из уже готовых туров.

---

## ✅ Acceptance Criteria

1.  **Inventory Docs:** Сформирована таблица (Excel/Google) всех гайдов Stonly со статусом (Migrate / Update / Deprecate).
2.  **Checklist Matrix:** Готова матрица для 5 сценариев с пошаговыми действиями и привязкой к ролям.
3.  **Trigger Mapping:** Для каждого шага описан конкретный триггер выполнения (событие в системе или Stonly API, переводящее пункт в "Done").
4.  **Microcopy Document:** Подготовлен документ с адаптированными текстами для тултипов, привязанных к селекторам (напр. `[data-tour="avatar-select"]`).
5.  **Implementation Scheme:** Разработана и обоснована схема: нативный React-виджет Pitch Avatar vs встроенный виджет Stonly.
6.  **Production Readiness:** Общий объем уникальных туров для записи и озвучки — 15 единиц (с учетом переиспользования для Fallback ветки).

---

## 🔄 Interaction Logic: Stonly ↔ Guideglow

**Концепция:**
*   **Welcome гайд (Stonly)** — обзор "вот что умеет продукт для твоей цели" → CTA переводит на экран. Это "посмотри и пойми" (3 шага).
*   **Чеклист + туры** — конкретные действия которые нужно выполнить. Пункты чеклиста не дублируют гайд, они его продолжают. Текущие формулировки чеклиста уже в императиве ("Создай", "Напиши").

**High-Level Flow:**
1. Welcome гайд Step 3 → CTA кнопка.
2. Открывается нужный экран продукта.
3. Чеклист появляется (bottom right). Пункт 1 уже ☑ (т.к. CTA привел к первому действию).
4. Пункты 2-5 ○ — пользователь кликает → Guideglow тур ведет руками по реальному интерфейсу.

### 💻 Техническая спецификация интеграции (Ticket)

**Цель:** пользователь кликает на пункт ○ в Stonly-чеклисте - Guideglow автоматически запускает нужный тур прямо в интерфейсе продукта.

**Флоу:**
1. Пользователь кликает на пункт ○ в чеклисте.
2. JS читает `data-tour-id` с элемента.
3. Если не на нужном экране — навигация туда.
4. После загрузки (800ms) — `Guideglow.startTour(tourId)`.
5. Пользователь выполняет действие в продукте (Activation event) → пункт становится ☑.

**Что реализовать:**
- JS-обработчик клика на пунктах чеклиста (после `StonlyWidget ready`).
- Навигация на нужный экран если пользователь не там.
- Запуск тура через `Guideglow.startTour(TOUR_MAP[tourId])`.
- Fallback если Guideglow не загружен — только навигация, без ошибки.
- Аналитика в PostHog: `guideglow_tour_started`, `guideglow_tour_completed`, `guideglow_tour_dismissed`.

**Критерии приёмки интеграции:**
- [x] Клик на ○ запускает нужный тур.
- [x] Если не на нужном экране — сначала навигация, потом тур.
- [x] Клик на ☑ — тур не запускается.
- [x] Если Guideglow не загружен — навигация без ошибки.
- [x] После выполнения действия пункт становится ☑, после закрытия без действия — остаётся ○.
- [x] Все 3 события приходят в PostHog с правильными параметрами.
- [ ] 7 туров протестированы на соответствующих экранах.

**Зависимости:**
- Маркетинг настроил чеклист с `data-tour-id` разметкой.
- Маркетинг создал туры в Guideglow и передал ID.

---

## ⚙️ Настройка в админке Stonly (Task for Marketing)

Для того чтобы гибридная интеграция с кодом заработала, необходимо выполнить следующие настройки на стороне панели управления Stonly:

**Быстрые ссылки на Stonly:**
* [Настроенные Web Triggers](https://app.stonly.com/app/general/45688/widget/WidgetTriggers/116103)
* [Созданные Чеклисты (Guides)](https://app.stonly.com/app/general/45688/content/guides/526626)

### 1. Точные названия шагов или data-tour-id (Критично!)
Команда маркетинга должна настроить чеклист с `data-tour-id` разметкой (согласно зависимостям интеграции). 
Если платформа Stonly не позволяет напрямую задать HTML-атрибуты, тексты пунктов в Stonly должны **буквально символ в символ** совпадать с ключами в нашем коде (`CHECKLIST_TOUR_MAP`), чтобы отработал наш fallback-скрипт (он сам найдет эти тексты и повесит атрибуты).

### 2. Правила показа (Routing / Audience)
В Stonly нужно задать условия (Audience / Trigger), чтобы чеклисты показывались нужным людям. Мы уже передаем им параметр `main_goal` при авторизации пользователя. В админке Stonly нужно прописать логику:
*   Если `main_goal` содержит `customer_support` ➔ показывать чеклист №2 (Chat).
*   Если `main_goal` содержит `slides` ➔ показывать чеклист №3 (Slides).
*(Аналогично для всех 5 сценариев из матрицы).*

### 3. Настроить метод выполнения шагов (Completion)
В админке Stonly для каждого шага нужно оставить опцию: **«Check the item manually»**.
Хотя это звучит как "ручное выполнение", наш JavaScript API (`stonly('setStepCompleted')`) всё равно умеет автоматически проставлять эти галочки, когда пользователь реально завершает тур в Guideglow.
**КРИТИЧНО:** В настройках каждого шага (Action on click) обязательно выберите **«No action»**. Наш код сам перехватит клик по тексту и запустит нужный интерактивный тур. Если поставить "Open URL", Stonly перезагрузит страницу и сломает флоу.

---

## Welcome Guide Stonly by goals
*By Anna Sannikova*

Welcome гайд ведёт к первому чеку в чеклисте. Чеклист подхватывает после того, как гайд закрыт, и тянет дальше.

**Формат:** видео

### 1. Guide Structure
Step 0 (Welcome) is shown to all users. After the user clicks "Let's go", Stonly reads `main_goal` and routes to the matching branch. The user does not choose - the path is pre-set based on their registration data.

*   **Step 0:** Welcome screen for all
*   **Step 1-3:** Personalized branch by `main_goal`
*   **Step 4:** CTA button → leads to activation event

### 2. Step 0 - Welcome
*Shown to every new user before branching.*

*   **Headline:** Welcome to Pitch Avatar 👋
*   **Body copy:** We know what you're here to do. Let's set you up your way, in under 5 minutes.
*   **Button:** Let's go →
*   **Stonly action:** On click → read `main_goal` → route to matching branch

### 3. Personalized Branches

#### Branch 1: Corporate Learning & Communications
`main_goal` = "create_ai_avatar_for_corporate_learning_and_communications"
*   **Step 1 headline:** Create training videos your team will actually watch

| Step | Content shown to user |
| :--- | :--- |
| 1 | **Choose your corporate avatar**<br>Pick a professional look or upload your own photo - this will represent your brand. |
| 2 | **Write your training script**<br>Type your content or let AI draft it in any language your team speaks. |
| 3 | **Generate & share with your team**<br>One link - everyone watches on any device. |

*   **CTA:** Create my first training video →
*   **Activation event:** Video generated / exported

#### Branch 2: Short Video with AI Avatar
`main_goal` = "create_a_short_video_with_ai_avatar"
*   **Step 1 headline:** Create your first AI video in under 2 minutes

| Step | Content shown to user |
| :--- | :--- |
| 1 | **Choose or create your avatar**<br>Upload your photo or pick a ready-made one. |
| 2 | **Write or generate your script**<br>Type what you want your avatar to say or let AI write it. |
| 3 | **Add voice & export**<br>Choose a voice, hit Generate - your video is ready. |

*   **CTA:** Generate my first video →
*   **Activation event:** Video generated / exported

#### Branch 3: Chat Avatar for Customer Support
`main_goal` = "build_conversational_avatar_for_customer_support"
*   **Step 1 headline:** Create an avatar that talks to your customers

| Step | Content shown to user |
| :--- | :--- |
| 1 | **Create your chat avatar**<br>Choose look and voice - this is the face your customers will see. |
| 2 | **Set up the conversation**<br>Define what your avatar knows and how it responds. |
| 3 | **Share the link**<br>Copy your avatar's link and send it to a customer. |

*   **CTA:** Share link →
*   **Activation event:** External session

#### Branch 4: Lead Generation Avatar
`main_goal` = "get_chat_avatar_for_lead_generation_on_website_or_in_emails"
*   **Step 1 headline:** Add an avatar to your website or email

| Step | Content shown to user |
| :--- | :--- |
| 1 | **Create your chat avatar**<br>Set up appearance and opening message - what will visitors see first? |
| 2 | **Get your embed code**<br>Copy the widget code - one paste and it's live. |
| 3 | **Embed on site or in email**<br>Paste it in. Your avatar is now working for you. |

*   **CTA:** Copy & embed →
*   **Activation event:** External session

#### Branch 5: Avatar for Slides
`main_goal` = "add_voiceover_and_or_ai_avatar_to_my_slides"
*   **Step 1 headline:** Bring your presentation to life

| Step | Content shown to user |
| :--- | :--- |
| 1 | **Upload your presentation**<br>PowerPoint or PDF both work. |
| 2 | **Add avatar & choose voice**<br>Pick who presents your slides and in what voice. |
| 3 | **Export or share**<br>Send a link or download your presentation now speaks for itself. |

*   **CTA:** Share my presentation →
*   **Activation event:** Presentation exported or shared

#### Branch 6: Video Localization
`main_goal` = "dub_or_translate_my_video"
*   **Step 1 headline:** Translate your video into another language

| Step | Content shown to user |
| :--- | :--- |
| 1 | **Upload your video**<br>Drop in your original video file. Most formats supported. |
| 2 | **Choose the target language**<br>29+ languages available. |
| 3 | **Export localized video**<br>Your translated video is ready — download or share the link. |

*   **CTA:** Export localization →
*   **Activation event:** Localized video exported

#### Branch 7: Just Exploring (Fallback)
`main_goal` = "i_am_just_playing_around / other / null"
*   **Step 1 headline:** Let's show you what's possible

| Step | Content shown to user |
| :--- | :--- |
| 1 | **Create an avatar video**<br>Takes 2 minutes. The quickest way to feel the product. |
| 2 | **Translate a video**<br>Upload any video and switch the language. Great to show a colleague. |
| 3 | **Add avatar to a presentation**<br>Drop in your slides - avatar does the talking. |

*   **CTA:** Try any scenario →
*   **Activation event:** Any completed key action

### 4. Content Rules

| DO | DON'T |
| :--- | :--- |
| **Language:** Task language: "Translate your video" | **Language:** Feature names: "Use Video Localization" |
| **POV:** First person: "my avatar", "my video" | **POV:** Product-centric: "the avatar", "the video" |
| **Steps:** One action per step, one CTA button | **Steps:** Multiple actions or choices per step |
| **CTA:** Links directly to activation screen | **CTA:** Links to dashboard or home |
| **Tone:** Direct, warm, confident | **Tone:** Technical, formal, or generic |

### 5. Analytics Events
*Add `main_goal` as a parameter to all existing Stonly events.*

| Event | Trigger | Parameters |
| :--- | :--- | :--- |
| `stonly_guide_branch_shown` | Branch displayed to user | `user_id`, `main_goal`, `branch_name` |
| `stonly_guide_step_completed` | Each step completed | `user_id`, `main_goal`, `step_number` |
| `stonly_guide_completed` | Full guide completed | `user_id`, `main_goal` |
| `stonly_guide_cta_clicked` | CTA button clicked | `user_id`, `main_goal`, `cta_label` |

### Сценарии видео (Video_guide branches scripts)

**Вариант 1 - Одно видео на шаг**
Пользователь сам листает. Stonly это поддерживает нативно.
*   **Шаг 1:** [видео 10 сек] + subtitle ➔ кнопка Next →
*   **Шаг 2:** [видео 12 сек] + subtitle ➔ кнопка Next →
*   **Шаг 3:** [видео 13 сек] + subtitle ➔ кнопка CTA →

**Вариант 2 - Одно длинное видео на всю ветку**
Все 3 шага склеены в одно видео ~35-40 сек. Пользователь смотрит целиком, потом CTA.

---

## ТЗ Dev Stonly Checklist ↔ Guideglow Tours интеграция
*By Anna Sannikova*

**Цель:** пользователь кликает на пункт ○ в Stonly-чеклисте - Guideglow автоматически запускает нужный тур прямо в интерфейсе продукта, подсвечивая нужные кнопки и элементы.

### 1. Описание
Stonly-чеклист показывает пользователю список задач, которые нужно выполнить для активации. Каждый пункт ○ (то есть «ещё не сделано») при клике должен не просто переводить на нужный экран - он должен запускать Guideglow-тур, который подсвечивает конкретные элементы интерфейса и ведёт пользователя за руку.

1. Пользователь видит чеклист в Stonly (виджет bottom right)
2. Кликает на пункт ○ — например «Generate your first video»
3. JS-обработчик перехватывает клик и читает `data-tour-id` с элемента
4. Если пользователь не на нужном экране - переводит туда
5. После загрузки экрана — `Guideglow.startTour(tourId)` запускает тур
6. Тур подсвечивает нужные UI-элементы, пользователь выполняет действие
7. Действие завершено — событие активации уходит в PostHog
8. Stonly получает сигнал → пункт чеклиста становится ☑

**Guideglow** - это интерактивный тур прямо в интерфейсе. Пользователь не смотрит видео и не повторяет после. Он делает всё в реальном продукте прямо во время тура.

Как это работает: Тултип появляется над кнопкой → пользователь кликает эту реальную кнопку → следующий тултип появляется на следующем элементе → пользователь делает следующее действие → тур завершён — действие уже выполнено в продукте.

### 2. Требования

#### 2.1 Разметка пунктов чеклиста
Каждый кликабельный пункт чеклиста в Stonly должен содержать data-атрибут с ID тура который нужно запустить. Это делается через кастомный HTML в настройках Stonly-чеклиста - на стороне маркетинга. Разработчику нужно обеспечить что JS-обработчик читает этот атрибут.

Пример разметки пункта (Stonly custom HTML):
```html
<button class="checklist-item" data-tour-id="tour_generate_video" data-screen="/editor">
  Generate your first video
</button>
```

| Приор. | Требование | Детали |
| :--- | :--- | :--- |
| **P0** | `data-tour-id` на каждом пункте ○ | Содержит ID тура в Guideglow. Маркетинг добавляет через Stonly custom HTML. Разработчик читает при клике. |
| **P0** | `data-screen` на каждом пункте ○ | Роут экрана куда нужно перейти перед запуском тура. Если пользователь уже на нужном экране - навигация не нужна. |
| **P1** | Пункты ☑ (выполненные) - клик не запускает тур | Клик на выполненный пункт ничего не делает или просто скроллит к нему. Тур не запускается. |

#### 2.2 JS-обработчик клика
Основная логика интеграции. Слушает клики на пунктах чеклиста, читает атрибуты, маршрутизирует и запускает тур.

| Приор. | Требование | Детали |
| :--- | :--- | :--- |
| **P0** | Обработчик вешается после Stonly ready | `StonlyWidget('on', 'ready', ...)` — гарантирует что чеклист уже в DOM. |
| **P0** | Навигация до запуска тура | Если пользователь не на нужном экране - сначала переход, потом тур после задержки 800ms. |
| **P0** | Задержка перед запуском тура | 800ms после навигации - дать странице отрендериться и Guideglow найти элементы. |
| **P1** | Graceful fallback если тур не найден | Если `Guideglow.startTour()` бросает ошибку - просто навигировать на экран без тура. Не ломать UX. |
| **P1** | Не запускать тур если Guideglow не загружен | Проверить `window.Guideglow` перед вызовом. Если не загружен — только навигация. |

#### 2.3 Маппинг Tour ID → экран
Таблица соответствия: какой тур на каком экране запускается. Guideglow Tour ID уточняется у маркетинга после создания туров в Guideglow. *(Заполнить после того как маркетинг создаст туры в Guideglow и получит их ID)*.

| Tour ID | Экран для навигации | Используется в чеклисте | Guideglow Tour ID |
| :--- | :--- | :--- | :--- |
| `tour_generate_video` | → уточнить роут | Чеклист 1 (Avatar), 5 (Fallback) | `gg_tour_XXX` |
| `tour_share_video` | → уточнить роут | Чеклист 1 (Avatar) | `gg_tour_XXX` |
| `tour_share_chat` | → уточнить роут | Чеклист 2 (Chat), 5 (Fallback) | `gg_tour_XXX` |
| `tour_embed_chat` | → уточнить роут | Чеклист 2 (Chat) | `gg_tour_XXX` |
| `tour_share_slides` | → уточнить роут | Чеклист 3 (Slides), 5 (Fallback) | `gg_tour_XXX` |
| `tour_upload_slides` | → уточнить роут | Чеклист 3 (Slides) | `gg_tour_XXX` |
| `tour_export_localization` | → уточнить роут | Чеклист 4 (Localization), 5 (Fallback) | `gg_tour_XXX` |

#### 2.4 Закрытие тура и обновление чеклиста
После того как пользователь завершил тур (или закрыл его) чеклист должен обновить статус пункта. Это происходит двумя путями: через событие активации из продукта, или через событие завершения тура из Guideglow.

| Приор. | Требование | Детали |
| :--- | :--- | :--- |
| **P0** | Stonly чеклист обновляется через activation event | Пункт становится ☑ когда продукт фиксирует выполненное действие — не через Guideglow. Stonly слушает кастомное событие. |
| **P1** | Guideglow `tour:completed` → PostHog | Логировать факт завершения тура отдельно от activation event — для анализа эффективности туров. |
| **P1** | Guideglow `tour:dismissed` → PostHog | Логировать на каком шаге пользователь закрыл тур — помогает найти проблемные шаги. |

#### 2.5 Аналитические события
| Событие | Когда | Параметры | Куда |
| :--- | :--- | :--- | :--- |
| `guideglow_tour_started` | Клик на пункт ○ чеклиста | `tour_id`, `triggered_from`, `user_id`, `main_goal` | PostHog |
| `guideglow_tour_completed` | Тур завершён полностью | `tour_id`, `user_id`, `main_goal` | PostHog |
| `guideglow_tour_dismissed` | Тур закрыт до завершения | `tour_id`, `step`, `user_id` | PostHog |
| `checklist_item_clicked` | Любой клик на пункт чеклиста | `tour_id`, `item_label`, `status` (done/todo) | PostHog |

### 3. Критерии приёмки
- [ ] Клик на пункт ○ в чеклисте запускает нужный Guideglow тур
- [ ] Если пользователь не на нужном экране - сначала происходит навигация, потом тур
- [ ] Задержка перед запуском тура достаточна - тур находит UI-элементы корректно
- [ ] Клик на пункт ☑ (выполненный) - тур не запускается
- [ ] Если Guideglow не загружен, то навигация на экран происходит, тур не запускается, ошибки нет
- [ ] После завершения тура и выполнения действия пункт чеклиста становится ☑
- [ ] После закрытия тура без действия пункт остаётся ○
- [ ] Событие `guideglow_tour_started` отправляется в PostHog при каждом запуске тура
- [ ] Событие `guideglow_tour_completed` отправляется при завершении
- [ ] Событие `guideglow_tour_dismissed` отправляется с номером шага при закрытии
- [ ] Все 7 туров протестированы на соответствующих экранах

### 4. Out of Scope
*   Создание самих Guideglow туров - на стороне маркетинга
*   Контент тултипов - на стороне маркетинга
*   Настройка чеклиста в Stonly - на стороне маркетинга
*   Дизайн чеклиста - отдельная задача
*   Welcome guide интеграция - отдельное ТЗ

### 5. Зависимости и порядок реализации
Эта интеграция реализуется в последнюю очередь - после того как маркетинг создаст туры в Guideglow и получит их ID. До этого разработчик может подготовить обработчик и маппинг с placeholder ID.

| Шаг | Действие | Кто |
| :--- | :--- | :--- |
| 1 | R4C-24881 задеплоен — `main_goal` передаётся в Stonly | Разработка |
| 2 | Маркетинг настраивает чеклист в Stonly с `data-tour-id` разметкой | Маркетинг (Анна) |
| 3 | Маркетинг создаёт 7 туров в Guideglow, получает их ID | Маркетинг (Анна) |
| 4 | Разработчик заполняет `TOUR_MAP` актуальными Guideglow ID | Разработка |
| 5 | Разработчик реализует JS-обработчик и аналитику | Разработка |
| 6 | QA тест всех 7 туров из чеклиста на соответствующих экранах | Маркетинг + QA |
