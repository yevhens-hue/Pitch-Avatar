# 🧠 Project Memory: Pitch-Avatar

Добро пожаловать в главную базу знаний проекта! Здесь собраны ссылки на все ключевые документы, архитектурные решения, спецификации (PRD) и бэклог.

---

## 🏛 Архитектура и Стратегия (Architecture & Strategy)
- [[ARCHITECTURE.md]] — Глобальная архитектура проекта.
- [[PRODUCT_STRATEGY.md]] — Продуктовая стратегия.
- [[MASTER_STRATEGY_REPORT_2026_04_05.md]] — Последний отчет о стратегии.
- [[AUDIT_REPORT_2026_04_04.md]] — Аудит проекта.
- [[AGENTS.md]] — Инструкции и правила для ИИ-агентов.
- [[docs/strategy_session_prep.md]] — Подготовка к стратегическим сессиям.
- [[README.md]] — Основное описание проекта.

---

## 📋 Текущая работа и Бэклог (Work & Backlog)
- [[BACKLOG.md]] — Основной бэклог задач.
- [[docs/issues/epic_templates.md]] — Шаблоны эпиков.
- [[docs/issues/sara_chat_layout_breakdown.md]] — Задачи по лейауту чата Sara.
- [[docs/issues/sara_voice_interruption_breakdown.md]] — Задачи по голосовым прерываниям Sara.

---

## 🎯 Спецификации и Эпики (PRD & Epics)
*Все продуктовые спецификации собраны в папке `docs/prd`.*

**Universal Editor & Project Management:**
- [[docs/prd/epic_universal_project_editing.md]]

**Enrollments & Billing (Подписки и биллинг):**
- [[docs/prd/epic_enrollments.md]]
- [[docs/prd/epic_enrollments_quota_billing.md]]
- [[docs/prd/epic_billing_management.md]]
- [[docs/prd/prd_billing_management.md]]
- [[docs/prd/design_task_quota_billing.md]]
- [[docs/prd/use_cases_quota_expiration.md]]

**HR & Onboarding (HR-процессы и онбординг):**
- [[docs/prd/epic_hr_onboarding.md]]
- [[docs/prd/epic_hr_onboarding_advanced.md]]
- [[docs/prd/prd_hr_onboarding.md]]
- [[docs/prd/onboarding_cjm_checklists.md]]
- [[docs/prd/onboarding_stories.md]]
- [[docs/prd/templates_onboarding_cjm.md]]

**Listeners & Buyer Avatar (Слушатели и Аватары покупателей):**
- [[docs/prd/epic_listeners.md]]
- [[docs/prd/epic_listeners_assignments.md]]
- [[docs/prd/epic_buyer_avatar_coach.md]]
- [[docs/prd/buyer_avatar_questions_database.md]]
- [[docs/prd/implementation_plan_buyer_ai_avatar.md]]

**Sara Chat & AI Avatar (Ассистент Sara):**
- [[docs/prd/epic_rag_control_system.md]]
- [[docs/prd/prd_sara_chat_layout.md]]
- [[docs/prd/prd_sara_voice_interruption.md]]
- [[docs/prd/chat_avatar_support.md]]

---

## 🤖 Sara Assistant (Ядро ИИ-ассистента)
*Документация по внутреннему устройству ассистента Sara в `docs/sara`.*
- [[docs/sara/ai_onboarding_assistant_spec.md]] ⭐ **НОВАЯ — AI Onboarding Assistant MVP (26.06.2026)**
- [[docs/sara/business_workflow.md]]
- [[docs/sara/developer_architecture.md]]
- [[docs/sara/proactive_logic.md]]
- [[docs/sara/system_prompt.md]]
- [[docs/sara/training_knowledge.md]]
- [[docs/sara/video_workflow.md]]
- [[docs/sara/workflow.md]]

---

## 🚀 Процессы и Навыки (Process & Skills)
- [[PO_ONBOARDING.md]] — Онбординг для Product Owner.
- [[FIRST_WEEK.md]] — Задачи на первую неделю.
- [[docs/all_available_skills.md]] — Все доступные навыки для агентов.
- [[docs/product_management_skills.md]] — Навыки продуктового менеджмента.

---

## 🛠 Журнал диагностик (Troubleshooting Log)

### 2026-06-21 — Ошибки IDE: «Failed to fetch» / «Failed to load MCP servers»
**Симптомы:** в панели IDE *Settings → Customizations* и в чате агента ошибки `[unknown] Failed to fetch` (Token Usage) и `Failed to load MCP servers`.

**Проведённая диагностика (всё ОК):**
- `~/.gemini/config/mcp_config.json` — валидный JSON (6 серверов: 4 remote Google Cloud + `notebooks`, `visualization`).
- Node.js v25.9.0; `mcp_proxy_bundle.js` существует; локальный MCP-сервер успешно отвечает на `initialize`.
- `gcloud` авторизован (`shaforostov.e@gmail.com`); сеть до `googleapis.com`/`google.com` доступна (405/200).

**Вывод:** MCP-инфраструктура и окружение исправны. Ошибка — на уровне **самой IDE (Antigravity)**: внутренний бэкенд-запрос не проходит (Token Usage, список MCP и чат используют один и тот же эндпоинт).

**Решение (предварительное, не сработало):** перелогин/перезапуск/Refresh. Симптом сохранялся.

### 2026-06-21 (обновление) — ИСТИННАЯ ПРИЧИНА найдена в логах IDE
Логи: `~/Library/Application Support/Antigravity IDE/logs/<ts>/`.

**Корень:** локальный **Language Server** (`language_server_macos_x64`, Go-демон — мозг agent/Token Usage/MCP) **упал с паникой** (`ls-main.log`):
```
panic: runtime error: invalid memory address or nil pointer dereference [SIGSEGV]
  chatconverters/browser.(*BrowserSubagentStringConverter).ToOutputString
  TrajectoryChatConverter.GetNumTokensSinceLastCheckpoint
  checkpoint.MaybeCreateCheckpoint → AgentExecutor.Run → CascadeManager
[LS Main] Process exited with code 2
```
После краша main-процесс IDE бесконечно стучит в мёртвый порт LS (`main.log`):
`ConnectError: [unavailable] connect ECONNREFUSED 127.0.0.1:60506`.

**Почему падает именно Token Usage + Agent chat + MCP:** все они проксируются через LS. Token Usage считает токены траектории беседы → дёргает крашащийся конвертер browser-subagent шага. Account/Permissions/Browser идут НЕ через LS → работают. Auth исправен (`auth.log`: `signedIn`).

**Триггер:** «битая» беседа с browser-subagent шагом (напр. «Structuring Presentation And Roadmap»), на которой крашится чат-конвертер LS.

**Состояние:** новый LS (после re-login) поднимается на новом порту и работает, но main-процесс остаётся прибит к старому мёртвому порту `60506`. «Reload Window» это НЕ лечит — нужен **полный Cmd+Q**.

**Фикс:**
1. Полностью выйти из IDE (**Cmd+Q**, не «Reload Window»); убедиться, что процесс `Antigravity IDE` завершён.
2. Прибить осиротевшие `language_server_macos_x64` при наличии.
3. Запустить IDE заново — main пересоздаст соединение к живому LS.
4. Если LS снова крашится на старте — убрать/отложить проблемную беседу из стора `~/.gemini/antigravity-ide/brain/<id>/` (предварительно сделать бэкап).

### 2026-06-21 (обновление 2) — перезапуск НЕ помог, найдена конкретная беседа
Свежая сессия `logs/20260621T143030/`: LS **снова упал** в 14:35:44 с той же паникой `BrowserSubagentStringConverter.ToOutputString` → SIGSEGV → exit 2. Полный Cmd+Q не лечит, т.к. при старте включён «Open Agent on Reload» и IDE автоподгружает битую беседу.

**Виновная беседа (точно):** `~/.gemini/antigravity-ide/brain/45b01e5f-42e7-496a-a401-0f200ad09500/`
— единственная изменённая сегодня (mtime 14:31:11), содержит browser-subagent транскрипт. На ней LS крашится при подсчёте токенов для чекпоинта.

**Финальный фикс (выполнять во ВНЕШНЕМ Terminal.app):**
```bash
# 1. полностью закрыть IDE и LS
osascript -e 'quit app "Antigravity IDE"'; sleep 3
pkill -f "Antigravity IDE"; pkill -f language_server_macos_x64; sleep 2
# 2. отложить битую беседу в бэкап (обратимо)
mkdir -p ~/antigravity-brain-backup
mv ~/.gemini/antigravity-ide/brain/45b01e5f-42e7-496a-a401-0f200ad09500 ~/antigravity-brain-backup/
# 3. запустить IDE заново
open -a "Antigravity IDE"
```
Дополнительно: в Settings → Agent отключить «Open Agent on Reload», чтобы IDE не подхватывала беседы автоматически.

### 2026-06-21 (обновление 3) — НЕ обновление бинаря; триггерят несколько свежих бесед
- Бинарь LS и сборка IDE — от 1 июня (версия 1.107.0). Сегодня обновлений НЕ было → баг не от апдейта, а от данных.
- Десятки старых бесед с browser-subagent шагом (с мая) работают нормально → сам шаг не триггер; «отравлены» именно недавние беседы.
- После переноса `45b01e5f` LS снова упал в 14:44:23 (сессия `144343`) — IDE автооткрыла следующую свежую беседу `8ac703e5` (20.06 23:44) и упала на ней.

**Вариант A (точечно):** убрать свежие беседы `8ac703e5-...` и `edc7ea54-...` в бэкап + выключить «Open Agent on Reload» + начинать новый чат.

**Вариант B (полный откат истории на вчерашний вечер):** есть локальные снапшоты Time Machine (`2026-06-20-203444`/`220340`/`230312`). Откатывать ТОЛЬКО `~/.gemini/antigravity-ide/brain/` (код проекта не трогать). Через GUI Time Machine на папке `~/.gemini/antigravity-ide/` или `mount_apfs` + `rsync` из снапшота. Предварительно `cp -a` текущего brain в бэкап.

### 2026-06-21 (обновление 4) — точная локализация «Structuring Presentation And Roadmap»
- `brain/` = 111 бесед, 3.6 ГБ. Заголовки бесед в `brain/` НЕ хранятся (они в служебной БД IDE), поэтому grep по заголовку бесполезен.
- В окно крашей (сегодня 15:00–15:05, panic в 15:21:56) IDE по кругу грузит 3 самые свежие папки: `9caa6f42`, `45b01e5f`, `edc7ea54`. «Structuring Presentation And Roadmap» — одна из них.
- Важно: `45b01e5f` снова появилась после раннего переноса → LS пересоздаёт папку при попытке загрузки. Поэтому переносить беседы можно ТОЛЬКО при полностью закрытой IDE+LS.
- ФИКС: `/tmp/fix_antigravity.sh` — глушит IDE+LS, переносит 3 подозрительные беседы в `~/antigravity-brain-backup/` (обратимо). Затем: выключить «Open Agent on Reload», начать новый чат.

### 2026-06-21 — Фикс тестов ShareEnrollModal и EnrollmentsTable (Все тесты 100% зеленые)

**Проблема:** Падали тесты для `ShareEnrollModal` и `EnrollmentsTable`.
- В `ShareEnrollModal.test.tsx` использовалось устаревшее действие `createEnrollment` (заменено во фронтенде на `createEnrollmentDraft` и `generateEnrollmentLinks`), а также изменилось название вкладки с `Links` на `Enrollments`.
- В `EnrollmentsTable.test.tsx` кнопка меню действий проверяла текст `Update Content`, в то время как рендерился текст `Update Links`.

**Решение:**
1. Обновлен `ShareEnrollModal.test.tsx`:
   - Импорты и моки переписаны на `createEnrollmentDraft` и `generateEnrollmentLinks`.
   - Тесты переписаны под проверку новых вызовов.
   - Поиск кнопки вкладки изменен на поиск по тексту `/Enrollments/i`.
2. Обновлен `EnrollmentsTable.test.tsx`:
   - Ожидаемый текст кнопки действия в шестеренке изменен с `Update Content` на `/Update Links/i`.
3. Запущен полный прогон тестов (`npm run test`) — все 111 тест-сьютов (585 тестов) теперь успешно проходят.
4. Проверен Next.js билд (`npm run build`) — сборка и оптимизация страниц завершены успешно без ошибок.

### 2026-06-21 — Интеграция Stonly Onboarding Checklists & Guided Tours

**Что сделано:**
1. Инструмент туров переведен с Guideflow на нативный Stonly Guided Tours.
2. Создан утилитный хелпер [stonly.ts](file:///Users/yevhen/.gemini/antigravity/scratch/projects/github/Pitch-Avatar/src/lib/stonly.ts), который:
   - Отправляет события завершения пунктов чеклиста в Stonly Widget API (`checklist_item_completed`).
   - Передает события запуска, успешного завершения и закрытия/пропуска туров (`stonly_tour_started`, `stonly_tour_completed`, `stonly_tour_dismissed`) в PostHog, слушая сообщения `stonlyDataTransmission` от виджета Stonly.
3. Добавлен вызов идентификации пользователя `StonlyWidget('identify', ...)` в [ClientWidgets.tsx](file:///Users/yevhen/.gemini/antigravity/scratch/projects/github/Pitch-Avatar/src/components/Layout/ClientWidgets.tsx) с передачей `userId`, `email` и `main_goal` (из метаданных пользователя).
4. Интегрированы 18 activation events в продукте:
   - **Слайды**: `tour_upload_slides` (загрузка файла в `QuickWizard`), `tour_write_script` (переход на шаг 4 в `QuickWizard`), `tour_add_voice_or_avatar` (генерация в `QuickWizard`), `tour_share_slides` (копирование ссылки на слайды в `ShareEnrollModal` / `ShareModal`).
   - **Видео**: `tour_upload_background` (клик по Media Hub в `ProjectEditor`), `tour_create_avatar` (создание аватара в `ProjectEditor`), `tour_write_script` (редактирование скрипта в `ProjectEditor`), `tour_generate_video` (сохранение видео в `ProjectEditor`), `tour_share_video` (копирование ссылки на видео в `ShareEnrollModal` / `ShareModal`).
   - **Чат**: `tour_create_chat_avatar_1` / `_2` / `_3` (этапы создания чат-аватара в `Creator`), `tour_test_chat` (отправка сообщения в `Player`), `tour_chat_get_link` (копирование ссылки на чат в `ShareModal`).
   - **Локализация**: `tour_upload_video` (загрузка видео в `VideoWizard`), `tour_choose_language` (выбор языка в `VideoWizard`), `tour_choose_voice` (выбор голоса в `VideoWizard`), `tour_loc_download` (клик по скачиванию локализации в `ProjectsTable` или окончание дубляжа в `VideoWizard`).
5. Все 585 тестов успешно проходят (`npm run test`), а также продакшн сборка (`npm run build`) успешно компилируется без ошибок.

---

### 2026-06-22 — ADR: Архитектура шаблонов (Template Snapshot Model)

**Контекст:** В Admin Panel (`ProjectTemplatesTab`) шаблоны хранятся как ссылка (`selectedProjectId`) на существующий проект. При использовании шаблона пользователем — содержимое source project копируется в новый проект.

**Проблема текущей модели ("живая ссылка"):**
- Если admin меняет source project → все новые пользователи получают изменённый шаблон без предупреждения
- Нельзя версионировать или A/B тестировать шаблоны
- Нет фиксации момента "вот финальная версия"

**Принятое решение (3 итерации):**

| Итерация | Что | Статус |
|---|---|---|
| Сейчас | Добавить предупреждение в UI: "Изменение source project повлияет на новых пользователей" | ⏳ Планируется |
| Sprint +1 | Кнопка **"Publish Snapshot"** + поле `lastPublishedAt` + `version` | ⏳ Планируется |
| Sprint +2 | Полная snapshot-модель: `snapshotData: JSON` в схеме, клонирование snapshot (не live project) | ⏳ Планируется |

**Snapshot-модель (Sprint +1/+2):**
```
[Admin] выбирает Source Project → нажимает [🔄 Publish]
  → система делает снимок проекта → сохраняет в snapshotData
  → lastPublishedAt = now(), version++

[User] выбирает шаблон → клонируется snapshot (НЕ live project)
```

**Затронутые файлы:**
- [`src/components/Settings/Tabs/ProjectTemplatesTab.tsx`](file:///Users/yevhen/.gemini/antigravity/scratch/projects/github/Pitch-Avatar/src/components/Settings/Tabs/ProjectTemplatesTab.tsx) — UI кнопка Publish
- [`src/data/presentation-templates.ts`](file:///Users/yevhen/.gemini/antigravity/scratch/projects/github/Pitch-Avatar/src/data/presentation-templates.ts) — добавить `snapshotData`, `version`, `lastPublishedAt`
- `src/app/actions/templates.ts` — Server Action `publishTemplateSnapshot(projectId, templateId)`

---
### 2026-06-22 — Universal Project Editor & Dynamic Menu

**Контекст:** Необхідність об'єднати редагування усіх типів проєктів (Presentation, Chat Avatar, Widget) в єдиний інтерфейс з адаптивним меню, щоб користувачу не доводилося проходити лінійні візарди для зміни окремих параметрів.

**Що зроблено:**
1. **Адаптивне меню (`ProjectEditor.tsx`):** Створено універсальний Top Bar, який динамічно відображає пункти меню (`Slides`, `Avatar`, `Knowledge Base`, `Instructions`, `General Settings`, `Import`, `Share/Assign`) залежно від типу проєкту (`isWidget`, `projectType`).
2. **Типи проєктів:** Додано тип `'widget'` та поле `isWidget` у `src/types/project.ts`.
3. **Панелі налаштувань (Tabs & Advanced):** Кожен пункт меню відкриває окрему панель.
   - `AvatarPanel.tsx` (General, Voice Settings)
   - `KnowledgeBasePanel.tsx` (File, Link, Text, drag-drop)
   - `InstructionsPanel.tsx` (Role, Instructions library)
   - `SettingsPanel.tsx` (Project info, Avatar Behavior toggles, Access)
   - `ImportPanel.tsx` (Upload Presentation/Video)
4. **UI/UX:** Використання Progressive Disclosure — складні параметри приховані під кнопкою `Advanced`. Панелі монтуються без перезавантаження сторінки.

**Затронуті файли:**
- `src/components/ProjectEditor/ProjectEditor.tsx`
- `src/components/ProjectEditor/panels/*`
- `src/types/project.ts`

---
### 2026-06-23 — Оновлення ТЗ для Source Projects (Admin Panel)

**Контекст:** Змінено логіку додавання проектів в розділі "Source Projects" (супер адмін). Раніше кнопка "Add project" відкривала модальне вікно для створення нового проекту. 

**Що змінилось:**
1. **Створення проектів** тепер відбувається в загальному розділі `All projects`.
2. **Логіка кнопки "Add project"** в `Source Projects` змінилася: тепер вона відкриває модальне вікно для **вибору** існуючого проекту зі списку проектів супер адміна.
3. **Модальне вікно:** замість `input`-поля для введення назви проекту використовується вибір (dropdown/select) з існуючих.
4. **Видалення з таблиці:** означає видалення (відкріплення) проекту зі списку `Source Projects`, а не видалення з системи.

---
### 2026-06-25 — Мітинг: Рішення по Templates (Source Projects → Add Template)

**Контекст:** Дизайн Templates затверджується Павлом + Вікою. В процесі утвердження з'явились нові вимоги. Зафіксовано три варіанти реалізації Source Projects.

**Архітектурне рішення (консенсус мітингу):**
- Розділ **Source Projects** — прибирається. Функціонал зливається в один новий розділ **Add Template**.
- Старий розділ **"Шаблони презентацій"** — залишається, допиляється окремо (для наслоєнь, бекграундів тощо).

**Обраний варіант — джерело шаблонів з Project Templates:**
- SuperAdmin створює презу через **Project Templates** (існуючий розділ).
- У **Add Template** підтягується список саме з Project Templates.
- **Project Templates editor** потребує cleanup: авто-controls, обрізання слайдів, тип продукту — зробити опціональними (чекбокси, вимкнені за замовч.). Оцінка — Тьома.

**Відхилено:**
- Варіант "All Presentations" — тисячі чужих презентацій без структури.
- Варіант "User sharing via consent" — юридичні ризики, потрібна модерація, сотні годин, Chat Avatar все одно недоступний.

**Критичне технічне обмеження (зафіксувати):**
> **Chat Avatar у шаблонах — заблоковано.** SuperAdmin не має `компанії` в системі. Chat Avatar жорстко прив'язаний до компанії (баланси, ролі, асистент). Жоден із варіантів Source не вирішує це на MVP. → Відкладено на наступний епік, потребує окремого дослідження.

**Відкриті питання (очікують затвердження Павла):**
1. Source — з Project Templates, а не з All Presentations?
2. PT editor — controls/тип/обрізання стають опціональними (off за замовч.)?
3. ~~Новий дизайн від Слави (таблиця замість модалок) — ок?~~ **✅ Затверджено**
4. Chat Avatar у шаблонах — підтвердити, що це наступний епік?

**Оновлення 14:50 — Утвердження дизайну та Presenter View:**
- **Адмінка (дизайн від Слави) — УТВЕРДЖЕНА Павлом без зауважень.** Це розблоковує розробку Add Template.
- **Presenter View (Preview шаблону):** Павлу показано дизайн превью для юзера (великий перший слайд + горизонтальний filmstrip знизу для гортання). Пояснено, що окремий fullscreen поки не робили через великий розмір самого блоку превью. Очікуємо підтвердження, чи достатньо такого UX.

**Деталізований аналіз:** [`templates_decision.md`](file:///Users/yevhen/.gemini/antigravity-ide/brain/409b1218-399f-4380-ab65-c3f93acd8478/templates_decision.md)


---
### 2026-06-26 — Мітинг: Архітектура Sara AI Onboarding Assistant (MVP)

**Учасники:** Костянтин, Надія, Євген, Юрій, Олексій

**Ключові рішення:**
- **Prompt System:** Перенести формування промтів з PHP на **Go-сервіс**. Використовувати `RoleDataUserPrompt` + `RolePrompt`. Контекст сторінки — динамічно до кожного LLM-запиту.
- **Комунікація:** REST API (двостороння) + **WebSocket** (Backend→Frontend push). Webhook — визнано повільним, замінюється.
- **Контекст сторінки:** передавати `currentUrl`, `activeTab`, `errors`, `warnings` + текстовий `pageDescription` (готує Надія).
- **Навігація:** через URL-параметри + `OpenURL` action з `useNavigate`.
- **MVP НЕ включає:** модальні вікна (немає ID у елементів), відео, чипси, аналітику, мультимовність.

**Розподіл завдань:**
- Костянтин → система промтів (Go)
- Надія → описи контексту для кожної сторінки
- Юрій → передача контексту через параметри
- Олексій → навігація по URL
- Євген → ця специфікація ✅

**Повна специфікація:** [`docs/sara/ai_onboarding_assistant_spec.md`](file:///Users/yevhen/.gemini/antigravity/scratch/projects/github/Pitch-Avatar/docs/sara/ai_onboarding_assistant_spec.md)

---
### 2026-06-28 — Coach (тренажёр навыков): фиксы багов + UI/UX-редизайн

**Контекст:** Доработка интерфейса тренажёра на странице `/coach/[projectId]`. Компонент — [`src/components/Coach/TrainModeUI/TrainModeUI.tsx`](file:///Users/yevhen/.gemini/antigravity/scratch/projects/github/Pitch-Avatar/src/components/Coach/TrainModeUI/TrainModeUI.tsx), стили — [`TrainModeUI.module.css`](file:///Users/yevhen/.gemini/antigravity/scratch/projects/github/Pitch-Avatar/src/components/Coach/TrainModeUI/TrainModeUI.module.css).

**Фаза 1 — Функциональные баги и безопасность:**
1. Вкладка «База знаний» не отображала данные → исправлен рендеринг списка вопросов/ответов.
2. Пагинация ломалась при большом числе слайдов → алгоритм «окна» с многоточием (`getPaginationItems`), при >9 слайдах показываются первый/текущий/последний.
3. Чат не скроллился к низу → добавлен `chatBottomRef` + авто-скролл.
4. Баг подсчёта очков (stale-замыкание) → синхронный счётчик через `correctCountRef` (useRef), убрана ручная «+1»-компенсация.
5. `showScore` ('end' vs 'immediate') давали одинаковый итог → логика разведена.
6. Удалён мёртвый стейт (`isChecking`, `showAnswer` и др.).
7. XSS в `dangerouslySetInnerHTML` → безопасный `renderFormattedText` (только **жирный** через маппинг в React-ноды).

**Фаза 2 — UI/UX, локализация, CSS:**
- Полная локализация интерфейса на русский (строки, тосты, `aria-label`, формы тренера, модалка).
- Убрано дублирование заголовков на слайде (плашка «Слайд X / N» + название колоды + реальный `slide.title`, без второго «Slide N»).
- Пустое правое полотно заменено hero-карточкой старта сессии (`introCard`); поле ввода появляется только в активной сессии.
- Хардкод-цвета заменены на токены: `var(--primary)`/`var(--primary-hover)`, `var(--status-*)`, `var(--fill-blue)`/`var(--stroke-blue)`.
- Все inline-стили вынесены в CSS-модуль (модалка, оверлеи тестов, pop-quiz, статусы оценки, форма тренера и т.д.).
- `handleAction` переписан на типизированные ключи (`MessageAction`) — попутно починилось «Q&A → Хранилище» (рассинхрон строковых ключей).
- A11y: семантика (`header`/`main`/`aside`/`nav`), `role="tab"`/`aria-selected`, `role="dialog"`, закрытие модалки по фону/`Esc`/крестику, `htmlFor`/`id` в полях.

**Хрупкий хедер:** «магическое» `padding-right: 150px` → именованный токен `--lab-badge-reserve` (резерв под глобальный фикс-бейдж «LAB VERSION» из `MainLayout`), обнуляется на узких экранах.

**Адаптив:** `≤1024px` — рабочая область в колонку, правая панель на всю ширину; `≤640px` — перенос хедера/кнопок. Тайпчек по компоненту чистый.

### 2026-06-28 — Coach (Train Mode): Финализация фич из PRD

**Контекст:** Реализация оставшихся требований к режиму тренировки (Train Mode) в `/coach/[projectId]` на основе отзывов из PRD.

**Что сделано:**
1. **Hybrid Dialog Mode:** Добавлен выбор стартового режима "Start Mode" (кто начинает диалог: Продавец или Аватар).
2. **Buyer Persona:** Добавлены настройки персонажа покупателя (Скептик, Контролер бюджета и т.д.) для персонализации ответа аватара. Настройки добавлены в Session Settings.
3. **Панель тестирования (Check Answer):** Прямо под редактором сценариев (вопрос-ответ) в Train Mode добавлена панель для тестирования ответа через API `/api/coach/evaluate`, чтобы тренер мог увидеть оценку ИИ до сохранения в базу знаний.
4. **Разделение логики сохранения (Save Target):** Внедрены две отдельные кнопки ("Save to RAG" и "Save as Scenario") с передачей параметра `saveTarget` в API.
5. **Загрузка существующих вопросов (Load to Editor):** В списке сохраненных вопросов в Knowledge Base добавлена кнопка "Загрузить в редактор" (⚡️) для быстрого переноса существующего сценария в форму редактора и панель тестирования.
6. Внесены исправления в тесты `TrainModeUI.test.tsx`, чтобы они покрывали новые компоненты интерфейса (кнопки сохранения, панель тестирования, настройки сессии).

---
*💡 Заметка: Этот файл обновляется автоматически при появлении важных архитектурных изменений. Если вы хотите, чтобы ИИ сохранил результат нашего разговора, просто скажите: "Запиши в память".*
### Test Credentials
- **Prod App (app.pitchavatar.com)**: `yevhen.shaforostov@roi4cio.com` / `zbc1ehv4xap.RWB@kmx`
