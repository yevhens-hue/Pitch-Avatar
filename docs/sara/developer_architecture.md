# Архитектура и Воркфлоу виджета Sara AI (Universal Widget)

Этот документ описывает логику работы интеллектуального помощника Sara. **Важное изменение:** виджет Sara теперь является полностью независимым продуктом (Universal Widget), который интегрируется с любым веб-приложением (включая Pitch Avatar) через REST API.

## 1. Базовый Workflow (Схема взаимодействия)

Виджет не содержит бизнес-логики конкретного продукта и не знает структуру приложения, в которое он встроен. Вся коммуникация инициируется **Host App (Веб-приложением)** через универсальный API.

```mermaid
flowchart TD
    %% Стили
    classDef hostApp fill:#f0f9ff,stroke:#0284c7,stroke-width:1px,color:#0369a1;
    classDef widgetAPI fill:#fff7ed,stroke:#ea580c,stroke-width:1px,color:#9a3412;
    classDef widgetLogic fill:#f0fdf4,stroke:#16a34a,stroke-width:1px,color:#15803d;

    subgraph HostApp [Host Application (Pitch Avatar)]
        PageChange([Смена страницы])
        UserEvent([Действие пользователя])
        AppError([Системная ошибка])
    end

    subgraph WidgetAPI [Widget REST API / Inbound]
        PushContext[Обновление контекста]
        PushEvent[Передача события]
        PushConfig[Обновление конфигурации UI]
    end

    subgraph Widget [Sara AI Widget]
        TriggerEngine{Trigger Engine}
        ShowBubble[Показ бабла]
        Chat[Интерфейс чата]
        OutboundAPI[Outbound Events / Webhooks]
    end

    PageChange --> PushContext
    UserEvent --> PushEvent
    AppError --> PushEvent
    
    PushContext --> TriggerEngine
    PushEvent --> TriggerEngine
    
    TriggerEngine -->|Совпадение условий| ShowBubble
    TriggerEngine -->|Нет триггера| Idle([Ожидание])
    
    ShowBubble --> Chat
    Chat --> OutboundAPI
    
    OutboundAPI -.->|Выполнить UX сценарий| HostApp

    class HostApp hostApp;
    class WidgetAPI widgetAPI;
    class Widget widgetLogic;
```

**Шаг за шагом:**
1. **Host App (Приложение):** Приложение отслеживает, где находится пользователь и что он делает.
2. **Inbound API:** Приложение отправляет REST-запросы к виджету, передавая `context` (например, `page: "editor"`, `project_id: "123"`) и `events` (например, `action: "idle_60s"`).
3. **Trigger Engine:** Виджет обрабатывает эти данные через движок триггеров. Если переданные параметры совпадают с настроенным триггером, виджет инициирует действие (показывает бабл или выполняет сценарий).
4. **Outbound API:** Если виджету нужно открыть модальное окно или запустить тур, он отправляет событие (JS Event или Webhook) обратно в Host App, которое и выполняет бизнес-логику.

---

## 2. Widget REST API (Inbound)

Взаимодействие с виджетом происходит через стандартизированный API. Виджет не вычисляет эти данные сам.

* `POST /context` — Передача текущего экрана, параметров проекта, пользовательского сценария.
* `POST /event` — Передача системных событий (ошибки, таймауты).
* `POST /config` — Настройка UI виджета "на лету" (включение/отключение кнопок, изменение брендинга, принудительное скрытие лишнего функционала для производительности).

---

## 3. Trigger Engine (Движок триггеров)

Вся логика виджета конфигурируется, а не программируется. Триггер определяет:
1. **Условие (Condition):** Привязка к переданному `context` или `event`.
2. **Действие (Action):** Открыть бабл, отправить заранее заготовленный текст от AI, запустить скрипт.

### Пример конфигурации триггера (вместо хардкода сценариев):
```json
{
  "trigger_id": "editor_idle",
  "condition": {
    "context.page": "video_editor",
    "event.action": "idle_timeout",
    "event.value": "> 60s"
  },
  "action": {
    "type": "show_bubble",
    "message": "Не знаете, что написать на слайде? Я могу помочь.",
    "cta_button": {
      "label": "Сгенерировать скрипт",
      "outbound_event": "START_AI_SCRIPT_TOUR"
    }
  }
}
```

---

## 4. Оптимизация производительности (Performance)

Виджет должен быть максимально легким для быстрой загрузки.
* **Удаление специфичной бизнес-логики:** Из виджета удален весь код, специфичный для Pitch Avatar (обработка слайдов, звонки).
* **Событийная модель:** Виджет активируется (рендерит тяжелые компоненты) только при получении конфигурации и первом открытии, до этого показывая лишь легковесный FAB.

---

## 5. Открытые вопросы для команды разработки (Team Lead)

1. **Outbound Communication:** Как именно виджет должен отправлять команды обратно в Host App для открытия UX-окон или запуска проектов? 
   * *Вариант 1:* Кастомные JS Events (`window.postMessage`) — оптимально для фронтенда.
   * *Вариант 2:* Webhooks на бекенд основного продукта.
2. **Конфигурация:** Где будут храниться JSON-конфигурации триггеров? Будет ли у нас админка для их настройки без изменения кода?
