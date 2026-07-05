# Epic R4C-25761: AI Widget Assistant with Application Context & UI Navigation (Universal Widget)

**Technical PM:** Pavlo Zhdanovych
**Assignee:** Basiieva Maryna / Yevhen Shaforostov

## Идея в одном предложении
**Widget ничего не знает о приложении. Всё — через параметры и триггеры.**
Независимый продукт, встраивается в любое приложение. Двусторонний REST. Никакого программирования в виджете — только конфигурация сценаристом.

---

## 1. Goal (Цель)
Розширити існуючий AI Widget, щоб він працював як незалежний продукт, який може інтегруватися з будь-якою веб-аплікацією через універсальний REST API.
Widget не повинен містити бізнес-логіку конкретного застосунку. Весь контекст, події та параметри передаються зовнішнім застосунком через API. Поведінка визначається Trigger Engine та налаштовується через Trigger-и і MultiActions.

## 2. Архитектура (Два потока)

### INBOUND · App → Widget
*App меняет параметр / шлет событие*
`External App` ➔ `Widget REST API` ➔ `PHP (auth)` ➔ `Триггеры + MultiActions (Go-trigger-service)` ➔ `WS / Socket.io (существующий)` ➔ `Widget FE (аватар говорит)`

### OUTBOUND · Widget → App
*Аватар отправляет команду*
`Widget / Триггер` ➔ `Action: outgoing_webhook (URL + JSON)` ➔ `External App (выполняет UI)` ➔ `callback: actions-queue status (success/failed)`

*Переиспользуем существующее:* движок триггеров, очередь MultiActions, статусы (pending/in_progress/success/failed/timeout/skipped), таблица `action_queues` как лог, доставку через WS/Socket.io.

## 3. Scope & MVP User Stories (Phase 1)

1. **US-01:** Навигация по UI по вопросу (Custom Domain) - *MVP*
2. **US-02:** Демо Use Cases через Stonly pop-up - *MVP*
3. **US-03:** Фактический ответ из базы знаний (RAG) - *MVP*
4. **US-04:** Ответ со ссылкой на инструкцию - *MVP*
5. **US-05:** Поздравление с первым проектом (App → Widget событие `project.created`) - *MVP*
6. **US-06:** Проактивная помощь по бездействию (App → Widget таймер + параметры) - *MVP*
7. **US-08:** Конфигурация и «облегчение» виджета (скрыть Call Presenter, убрать показ слайдов) - *MVP*

## 4. Phase 1.5 & Phase 2 (Future Scope)
* **Phase 1.5:** HMAC-подпись тела запроса, усиление идемпотентности, буфер событий.
* **Phase 2 (US-07):** Разговорное создание проекта (LLM + RAG + команды). Манифест / allow-list команд. Публичный WebSocket / SSE API.

## 5. Research Tasks (Ожидает решения Team Lead)
Необходим отдельный Research по архитектуре INBOUND REST API (Application → Widget) и механизму двусторонней взаимодействия, чтобы зафиксировать точные форматы обмена данными (session_id, external_user_id, ретраи, таймауты).
