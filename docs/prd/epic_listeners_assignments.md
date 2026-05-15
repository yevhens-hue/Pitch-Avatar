# Epic: Listeners & Assignments Management

**Description**

*   **Epic Name:** Listeners & Assignments Management
*   **Product Owner:** @Paul Zhdanovych
*   **Based on:** [PRD v.1.0] Модуль HR Onboarding & Engagement
*   **Status:** In Progress

## 1. Project Overview
Мы полностью перерабатываем логику взаимодействия с аудиторией. Устаревший механизм анонимных ссылок (Links) заменяется на полноценную систему рассылок задач (Assignments), а также вводится базовая сущность Слушателя (Listener). 
Главная цель — позволить пользователям вести базу контактов, сохранять их профили, отправлять автоматизированные цепочки писем, собирать аналитику в разрезе конкретного человека и монетизировать платформу через новую бизнес-модель "Listener Seats".

### 1.2. Business Value
*   **Экономия времени (Efficiency):** Клиенты один раз создают профиль слушателя (или импортируют пачкой) и используют его для всех будущих презентаций. Не нужно вводить данные вручную при каждой отправке.
*   **Глубокая аналитика (Transparency):** Появление сущности Listener позволяет наконец-то собирать статистику с разбивкой по людям, географии, компаниям и департаментам.
*   **Синхронизация (Connectivity):** Наличие профиля слушателя открывает двери для двусторонних интеграций с внешними системами (CRM, LMS, ATS).
*   **Новая монетизация (Revenue Growth):** Внедрение метрики `Listeners Seats` (активные слушатели) позволяет выставлять счета пропорционально реальной нагрузке и использованию платформы через PayPro Global.

### 1.3. Product Structure & Flow
Схема структуры: UI состоит из нового раздела меню `Listeners`, обновленного раздела `Assignments` (ранее Links) и интеграции проверки лимитов `Listeners Seats` в процесс создания рассылки.

*Прототипы:*
*Список Listeners*
Screenshot 2026-04-22 at 19.44.27.png

*Редактирование данных Listener*
Screenshot 2026-04-22 at 07.25.53.png

---

## 2. Readiness & Completion Criteria

### 2.1. Definition of Ready (DoR)
> [!IMPORTANT]
> Следующие условия должны быть выполнены перед началом разработки (добавлением в спринт):
> *   **Утверждение требований:** Бизнес-требования и User Stories согласованы со всеми стейкхолдерами.
> *   **Готовность БД (Бэкенд):** Спроектирована архитектура для новых таблиц `listeners`, `assignments` и механизм связи между ними.
> *   **Биллинг логика:** Алгоритм подсчета "активных" Listener Seats (у которых есть Assignments) четко определен на бэкенде.
> *   **Дизайн:** Figma-макеты для списков CRUD и модалок создания Assignment финализированы.

### 2.2. Definition of Done (DoD)
> [!NOTE]
> Эпик считается завершенным, если выполнены все следующие условия:
> *   **Функциональность:** CRUD операции для Listeners работают без ошибок (включая загрузку файлов).
> *   **Assignments:** Переход от ссылок (Links) к Assignments завершен. Письма с приглашениями и напоминаниями успешно отправляются через кастомные почтовые домены.
> *   **Контроль лимитов:** При попытке создать Assignment с превышением купленных мест (Seats), система жестко блокирует действие и показывает окно для апгрейда тарифа.
> *   **Качество:** Код прошел ревью, покрыт тестами и влит в production.

---

## 3. User Scenarios (Client Benefits)

**Scenario 1: Управление базой слушателей (Listeners CRUD)**
*   **Problem:** Каждый раз нужно заново вводить email и имя человека при создании ссылки. Аналитика обезличена. Аватар не может обращаться к зрителю персонализировано.
*   **Solution:** Как презентатор, я хочу добавлять слушателей в базу (поштучно или импортом CSV/PDF) и прикреплять к ним файлы. 
*   **Acceptance Criteria:**
    *   Пользователь видит новый пункт меню Listeners со списком и возможностью удаления/редактирования.
    *   В профиль слушателя можно загрузить файлы контента (например, резюме).
    *   Существующего слушателя можно выбрать в пару кликов при создании Assignment.

**Scenario 2: Лимиты и покупка Seats (Seats Billing)**
*   **Problem:** Мы тратим ресурсы на рассылки и аналитику, но не берем за это соразмерную плату.
*   **Solution:** Как супер-администратор, я задаю лимиты Seats. А как презентатор, я хочу получать понятное предупреждение, если я пытаюсь превысить свой лимит, и иметь возможность докупить места.
*   **Acceptance Criteria:**
    *   Суперадмин может вручную выставить лимит Listeners with Assignments для пользователя.
    *   При попытке отправить Assignment "лишним" слушателям, появляется блокирующее уведомление с кнопкой докупить.
    *   Цена покупки: до 100 мест — 10 USD/мес, свыше 100 — 8 USD/мес.

**Scenario 3: Рассылки и Автоматизация (Assignments)**
*   **Problem:** Приходится вручную копировать линки, писать письма в Gmail и руками проверять, посмотрел ли человек проект, чтобы напомнить ему.
*   **Solution:** Как презентатор, я хочу выбрать слушателей, назначить им проект и настроить расписание отправки приглашений и напоминалок.
*   **Acceptance Criteria:**
    *   Меню `Links` переименовано в `Assignments`. В таблице видны столбцы Listener, Project, Status, Start Date, Reminder.
    *   Вкладка `Invitation and Reminder` позволяет гибко настраивать текст письма и время отправки.
    *   Присутствует опция `Translate to Listener Language`.
    *   Админ может привязать свой кастомный почтовый домен для отправок.

---

## 4. UI Components & Interaction States (Структура «Формы»)

### 4.1. Listeners Directory
*   **List:** Таблица всех слушателей аккаунта с пагинацией и поиском.
*   **Profile Editor:** Модальное окно/страница с деталями (Email, Должность) и зоной для загрузки файлов (Drag & Drop).

### 4.2. Assignments Dashboard
*   **List View:** Таблица назначений. Индикация статусов: *Pending, In Progress, Completed, Failed*.
*   **Toggles:** Переключатели `Show Listeners in Groups` и `Show Projects in Courses`.

### 4.3. Assignment Configuration Modal
*   **General Tab:** Выбор Target (Anonymous / Listeners) и контента (Project).
*   **Invitation & Reminders Tab:** Текстовый редактор письма с переменными. Настройки интервалов напоминаний.
*   **Links Tab:** Доступ к прямым ссылкам, QR-кодам и HTML iframe.

### 4.4. Billing & Notification Alert
*   **Overage Banner/Modal:** Предупреждение о превышении квоты Listeners Seats при сохранении Assignment (с прямой ссылкой на оплату в PayPro).

---

## 5. Launch Phases (Implementation Roadmap)

Проект разбит на логические шаги для поэтапного релиза:

*   **Phase 1: База Listeners (Спринт 1)**
    *   **Business Goal:** Создать ядро данных. Научить систему хранить и отображать профили слушателей, чтобы подготовить базу для привязки к ним проектов.
*   **Phase 2: Assignments Core & Emails (Спринт 2)**
    *   **Business Goal:** Запустить ядро рассылок. Переименовать Links в Assignments, настроить привязку слушателей к проектам и запустить автоматические цепочки email-приглашений.
*   **Phase 3: Биллинг и Лимиты (Спринт 3)**
    *   **Business Goal:** Монетизировать функционал. Внедрить подсчет "активных" Seats, алерты о превышении лимитов и тарификацию.

---

## 6. Links & References
*   **Базовый PRD:** [[PRD v.1.0] Модуль HR Onboarding & Engagement](./prd_hr_onboarding.md)
*   **Технический Эпик:** [HR Onboarding (Спринты 1-4)](./epic_hr_onboarding.md)
*   **Монетизация:** Документация PayPro Global Metered Billing.

### 6.1. Документация от CEO (Confluence)
*   [Listeners - CRUD](https://roi4cio.atlassian.net/wiki/spaces/pitchavatar/pages/1562542081/Listeners+-+CRUD)
*   [Listeners Seats Setting, Control, Billing](https://roi4cio.atlassian.net/wiki/spaces/pitchavatar/pages/1562542170/Listeners+Seats+Setting+Control+Billing+-+Listeners+Assignments)
*   [Assignments - Links Share -> Share/Assign](https://roi4cio.atlassian.net/wiki/spaces/pitchavatar/pages/1565425665/Assignments+-+Links+Share+Share+Assign)
