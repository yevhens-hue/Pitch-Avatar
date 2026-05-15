# Эпик: Модуль HR Onboarding & Engagement

## 1. Бизнес-цели и Анализ AI-команды

### 🤖 Исследователь (User Needs & Flow)
**Выводы:** Существующий флоу анонимных ссылок (Links) не подходит для HR-онбординга и B2B обучения. Необходима базовая сущность `Listener` (Слушатель). Без неё невозможно отправлять персонализированный контент, собирать аналитику в разрезе человека и выставлять счета (Billing).
**Рекомендация:** Сконцентрироваться на цепочке: Listener -> Assignment -> Results -> Integrations.

### 📊 Бизнес-аналитик (Metrics & Monetization)
**Выводы:** Внедряется новая модель монетизации: **Listener Seats** (Места слушателей). 
**Метрики и биллинг:**
- Определение Seat: слушатель, у которого есть хотя бы один активный (in progress) Assignment на текущий момент.
- Модель ценообразования AWS-like (Tiered PayPro Global metered pricing): например, до 100 мест — $10, свыше 100 — $8 (Volume discount).
- Роли: Superadmin (устанавливает лимит для аккаунта), Account Admin (докупает места через self-service), Presenter (получает предупреждения о лимитах).

### 📈 Ключевые бизнес-процессы (Use Cases)
Внедрение новых сущностей расширяет применимость платформы для четырех основных направлений:
1. **L&D (Learning & Development):** Наставничество, обучение и тестирование сотрудников.
2. **Sales:** Презентация продуктов и автоматическая квалификация лидов.
3. **Recruitment:** Автоматизированные первичные интервью и AI-скрининг CV кандидатов.
4. **CustDev:** Масштабная проверка продуктовых гипотез и сбор обратной связи.

### 🎯 Маркетолог (Go-To-Market)
**Выводы:** Автоматизация рутинных задач — главный драйвер продаж (устраняем ручную отправку писем и ручную проверку открытий). Интеграция с LMS/HRS/CRM/ATS (двусторонняя синхронизация) делает продукт не "еще одной изолированной тулзой", а нативной частью бизнес-процесса Enterprise-клиентов.

### 🏗️ CTO (Architecture & Scalability)
**Выводы:** 
- `email` в сущности `Listener` — это `unique key per account` (conflict resolution при импорте и foreign key для интеграций).
- Базы данных: В Спринте 1 необходимо заложить "пустые" таблицы для будущих сущностей (`groups`, `listener_groups`, `courses`, `course_projects`), чтобы сразу получить чистые Foreign Keys (FK) и избежать сложной миграции во второй фазе.
- Разделение `Assignment` и `Assignment Link` в отдельные таблицы уже сейчас, чтобы в будущем легко перейти к матричной структуре (Group x Course).

### 💻 Инженер (Implementation Strategy)
**Выводы:** Реализация разбита на 4 логических спринта (около 9-11 недель работы). Зависимости жесткие: без Listener нет Assignment, без Assignment нет Results и т.д.

---

## 2. Архитектура и Структура Базы Данных (ER-модель)

### Основные сущности (Main 5)
1. **Listener** `[НОВАЯ]`
   - Поля: `id`, `email` (Unique), `first/last_name`, `company`, `industry`, `position`, `linkedin`, `country`, `department`, `language`, `documents[]`.
   - Ключевое: `language` определяет язык автоперевода писем; `documents[]` (PDF, Docx) загружаются и скармливаются LLM как контекст для аватара.
2. **Assignment** `[НОВАЯ/ЗАМЕНЯЕТ LINK]`
   - Поля: `id`, `title`, `listener_id` (FK), `project_id` (FK), `status` (Pending, In Progress, Completed, Failed), `start_date`, `email_schedule`.
3. **Assignment Link** `[НОВАЯ]`
   - Поля: `id`, `assignment_id`, `listener_id`, `project_id`, `unique_url`, `created_at`.
4. **Listener Seat** `[НОВАЯ]`
   - Поля: `per_account`, `max_seats`, `active_count`, `billing_tier`, `daily_snapshot`.
5. **Result** и **Result Value** `[НОВАЯ]`
   - `Result`: `id`, `name`, `data_type` (string, bool, integer, double), `parameter`, `aggregation` (Last value, Sum, Max, Use LLM), `llm_prompt`.
   - `Result Value`: `id`, `assignment_link_id`, `result_id`, `value`, `computed_at`.
6. **Integration** `[НОВАЯ]`
   - Поля: `id`, `result_id` (FK), `direction` (Send/Receive), `application`, `entity`, `field`, `create_new_entity`.
7. **Project/Course Type** & **Course Type Result** `[НОВАЯ]`
   - Связь M:N для автоматического назначения пула Result-метрик при выборе типа проекта (например, "Interview").

### Сущности "на будущее" (заглушки в Спринте 1)
- `Group`, `listener_groups` (M:N)
- `Course`, `course_projects` (M:N)

---

## 3. План Спринтов (Sprint Plan)

### Sprint 1: Foundation (Фундамент)
*Без правильной схемы БД и Listener ничего не работает.*
- Listener CRUD (Create, Edit, Delete, List, Search, Pagination). Экран со списком и формой (поля: name, email, position, last activity).
- DB Schema: создание таблиц `listeners`, `assignments`, `assignment_links` (пустая пока), заглушки `groups`, `listener_groups`, `courses`, `course_projects`.
- Project/Course Type Administration (CRUD).
- Result catalog CRUD + Result Value schema.

### Sprint 2: Assignments Core (Ядро рассылок)
*Механизм доставки контента и автоматизации писем.*
- Assignment CRUD (Target Type = Listener). Переход от ручного Share к автоматизированному.
- Email invitations + reminders (до 3 раз) + Translate to Listener Language. Тихий режим (тихие открытия).
- Настройки Custom email domain + sender.
- Вкладка Links (генерация, copy, QR code, HTML embed). Двухступенчатая генерация (Create -> Update links), чтобы сохранять Assignment ID при изменении проекта.

### Sprint 3: Results + Analytics (Аналитика и Метрики)
*Измерение эффективности и ROI.*
- Result aggregation pipeline (Last Value, Sum, Max, LLM). **Важно:** Использовать JSON Mode для вызовов LLM.
- Analytics Results Tab с выбором колонок (динамические столбцы на основе типа проекта/метрик).
- Manual Result Entry (модалка для ручного ввода `status` и `positive result date` — например, если кандидат нанят офлайн).
- Project/Course Type -> auto Results (автоподтягивание списка нужных результатов по типу проекта).

### Sprint 4: Billing + Integrations (Монетизация и Синхронизация)
*Связь с бизнес-системами.*
- Listener Seats quota check при создании Assignment (алерты).
- Tiered billing integration (PayPro Global metered).
- Super-admin Seats management.
- Integration CRUD + Webhook handler.
  - Направления: `Send` (Outbound в CRM) и `Receive` (Inbound из CRM).
  - Уникальная фича: `Create new entity` (автоматическое создание Deal/Contact/Task в HubSpot или Salesforce на основе результата, например `wants_meeting = true`).

---

## 4. UI/UX Детали и Требования (Front-end)

### Listeners
- **Таблица:** Колонки `Name`, `Email`, `Position`, `Last Activity`, `Actions`. `Last Activity` высчитывается по max timestamp сессий. Поиск full-text, серверная пагинация, сортировка по Last Activity DESC.
- **Кнопки в хедере:** `Export`, `Import` (CSV/CV) — закладываются в UI сейчас, даже если логика будет в следующих фазах.
- **Форма:** Drag & Drop зона для `Documents[]`. Дропдаун `Group` должен быть виден (пусть и disabled), чтобы не переделывать UI позже.

### Assignments
- **Создание (General Tab):** Поля `Title`, `Presenters`, `Target type` (Listener/Anonymous), `Content type` (Project/Course), `Link to calendar` (Calendly/Hubspot).
- **Напоминания (Invitation and Reminders):** Шаблоны писем с плейсхолдерами (`{{listener_first_name}}`, `{{avatar_name}}` и т.д.). Тоггл "Translate to Listener language".
- **Модалка ввода результатов (Manual):** Поля `Status` (Completed, Failed и т.д.) и `Positive result date`.

### Results (Каталог и Аналитика)
- **Каталог (Administration):** Единый центр хранения всех метрик (системных, кастомных LLM, интеграционных).
- **Форма Result (Use LLM):** Многострочное поле для Prompt моноширинным шрифтом с поддержкой Autocomplete по системным параметрам.
- **Таблица Analytics:** Кнопка `Columns` для управления видимостью столбцов (Visited, Time Spent, Score, Custom metrics). Кнопка `Download Table` (экспорт в CSV/Excel).

### Integrations
- Управление маппингом (Ряд: Result X -> App Y -> Entity Z -> Field W). 
- Поддержка дублирования (один Result может уходить и в HubSpot, и в Salesforce).

### Сессии и Контроль (Session Control)
Для обеспечения достоверности результатов (особенно в Recruitment и L&D) закладывается функционал:
- **Запись видео камеры слушателя** (Video Recording).
- **Транскрибация сессии и генерация Meeting Resume**.
- **Идентифицикация личности и контроль подсказок** (Anti-cheating/Proctoring) во время прохождения Assignment.

## ⚠️ Открытые вопросы для обсуждения (Для команды)
1. **Права доступа:** Кто имеет право настраивать Integrations? Только Super Admin или Account Admin тоже? (Рекомендация: Account Admin может настраивать интеграции из предварительно одобренного списка).
2. **Оценка трудозатрат:** Насколько реалистична оценка по спринтам? (Например, Sprint 4 требует глубокой интеграции с PayPro Global и 3rd party API — возможно, стоит распараллелить работу над коннекторами).
3. **Удаление Listener:** Что происходит с аналитикой при удалении Listener? (Рекомендация: Soft delete для Listener + статус Archived для Assignment, чтобы сохранить аналитику).
