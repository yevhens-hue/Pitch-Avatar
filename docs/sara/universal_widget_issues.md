# Epic: R4C-25761 (AI Widget Assistant with Application Context)

Ниже приведены готовые вертикальные слайсы (Issues) для переноса в Jira. 
Они разбиты по принципу Tracer Bullets — каждая задача доставляет ценность от начала до конца.

---

# 1. [Research] Session Correlation & API Security
## Parent
Epic R4C-25761

## What to build
**HITL (Human-in-the-Loop) Task**
Прежде чем разрабатывать INBOUND API, необходимо задокументировать и утвердить архитектурное решение по идентификации сессий и безопасности.
Нужно ответить на вопросы:
1. Как именно связывать `session_id` (которым оперирует Widget и WS) и `external_user_id` (которым оперирует External App)?
2. Где и как будет проверяться API-ключ (на уровне PHP)?
3. Как обрабатывать ситуацию, когда External App шлет событие, но Socket-соединение с виджетом временно разорвано (ретраи/буфер)?

Результатом задачи должен быть короткий ADR (Architecture Decision Record) в комментариях к эпику.

## Acceptance criteria
- [ ] Описан флоу матчинга сессий.
- [ ] Утверждена схема аутентификации REST API.
- [ ] Team Lead оставил аппрув на решение.

## Blocked by
None - can start immediately

---

# 2. Create Widget INBOUND REST API & Session Routing
## Parent
Epic R4C-25761

## What to build
Создать базовый Inbound-поток. External App должен иметь возможность отправить POST-запрос с контекстом, который пройдет через PHP, попадет в Go-trigger-service и "оживит" виджет через Socket.io.
Это tracer-bullet: достаточно реализовать эндпоинт `POST /api/v1/widget/events`, принять валидный JSON с тестовым `event_name`, прокинуть его в Go-сервис, который найдет активный WS-канал по сессии и отправит тестовое текстовое сообщение аватару.

## Acceptance criteria
- [ ] Реализован эндпоинт на PHP с проверкой API-ключа.
- [ ] Go-trigger-service умеет принимать событие от PHP и маршрутизировать его в активный WS.
- [ ] При вызове API через Postman, аватар в браузере реагирует (отправляет тестовое сообщение).

## Blocked by
- Issue 1 ([Research] Session Correlation)

---

# 3. Implement US-01 & OUTBOUND Webhook Contract
## Parent
Epic R4C-25761

## What to build
Реализовать OUTBOUND поток для навигации. Когда срабатывает триггер на определенную фразу пользователя (например, вопрос про Custom Domain), Go-trigger-service должен отправить действие типа `outgoing_webhook` с JSON-пейлоадом во внешнее приложение (External App). 
External App (в тестовом моке) возвращает коллбэк на `actions-queue-status/{uuid}` со статусом `success`.

## Acceptance criteria
- [ ] Триггер умеет инициировать `outgoing_webhook`.
- [ ] Запрос уходит на настроенный URL External App с правильным форматом JSON.
- [ ] Go-trigger-service корректно обрабатывает callback-статус (pending -> success).
- [ ] Покрывает US-01.

## Blocked by
- Issue 2

---

# 4. Implement Proactive Event Triggers (US-05, US-06)
## Parent
Epic R4C-25761

## What to build
Настроить и обработать проактивные триггеры на основе INBOUND событий.
Реализовать поддержку события `project.created` (US-05) и таймера бездействия `idle_20s` (US-06) через параметры INBOUND API. Go-trigger-service должен уметь запускать сценарии аватара и отправлять команду на открытие Stonly pop-up (US-02) при получении этих событий.

## Acceptance criteria
- [ ] Триггер успешно перехватывает событие `project.created` и запускает диалог аватара.
- [ ] Триггер перехватывает параметр/событие таймера и предлагает помощь.
- [ ] При согласии пользователя генерируется OUTBOUND команда на показ Stonly.

## Blocked by
- Issue 2

---

# 5. Widget FE Configuration & Bundle Optimization
## Parent
Epic R4C-25761

## What to build
Оптимизировать Frontend виджета (Widget FE), сделав его легким и настраиваемым.
Необходимо добавить чтение объекта конфигурации при инициализации виджета. Конфигурация должна управлять отображением UI-элементов (скрыть/показать кнопку "Call Presenter", "Schedule Meeting").
Также необходимо провести рефакторинг бандла: вырезать или перевести в lazy-load тяжеловесные компоненты (например, показ слайдов презентаций), чтобы виджет загружался максимально быстро на любом стороннем сайте.

## Acceptance criteria
- [ ] Виджет принимает конфигурационный объект на старте.
- [ ] Кнопки и модули скрываются/показываются согласно конфигу.
- [ ] Модуль слайдов убран из основного бандла (lazy load или удален).
- [ ] Размер бандла и TTI (Time to Interactive) уменьшены.
- [ ] Покрывает US-08.

## Blocked by
None - can start immediately
