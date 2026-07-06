# [Design Task] Coach Mode — Wave 1: Wizard + Editor

## О проекте (Context & Goals)

Мы расширяем платформу Pitch Avatar новым модулем **Coach** — интерактивным AI-тренажёром для команд продаж. Модуль позволяет тренерам (PM / Admin) активировать Coach Mode при создании аватара, генерировать Q&A с помощью AI и настраивать параметры тренировки. А продавцы (слушатели) проходят тренировки с AI-аватаром в роли покупателя.

**Техническое ограничение первого этапа (Важно!):** Аватар не управляет слайдами за пользователя автоматически. AI-генерация Q&A работает в отдельном scope `coach_qa` и не смешивается с основной Knowledge Base. В Wizard изменения на step 3 должны быть минимальными — только добавление чекбокса и условный рендеринг шагов 4 и 5. Кнопка генерации Q&A по слайду в самом редакторе удаляется, вся генерация переносится в Wizard Step 4.

**Бизнес-цель:** Превратить Pitch Avatar в полноценную Sales Coaching Platform, сделать онбординг новых сейлзов структурированным, измеримым и масштабируемым.

## Где это находится

Элементы распределены по веб-приложению:
- Список проектов (`/projects`)
- Wizard создания аватара (`/projects/new`, шаги 3, 4, 5)
- Редактор проекта (`/projects/[id]/edit`, верхнее меню, правая панель и Preview)

## Ссылки и референсы

**Визуальная основа (Бейзлайн — главное!):** Дизайн строится на **реальных экранах** продукта (не wireframes). За основу берутся существующие компоненты и токены (`--primary`, `--fill-blue`, `--stroke-blue`, `--status-*`).
**Рабочий прототип:** https://pitch-avatar-lab.vercel.app/ (текущая реализация Train Mode)
**Спецификация:** `docs/prd/epic_buyer_avatar_coach.md`
**Презентация:** *Pitch Avatar · Coach UX · Phase 3 · Real UI* (v3.0, Июнь 2026)

## Что нужно нарисовать (Scope of Work)

### Блок 1: Список проектов (Project List)

**Задача:** Добавить визуальную идентификацию Coach-проектов в существующий список.
**Элементы:**
- **Колонка Mode:** Добавить новую колонку рядом с колонкой `Type`. Для Coach-проекта — иконка гантели 🏋 (accent color). Для обычного проекта — дефис «—».
- **Фильтр Mode:** Dropdown-фильтр вверху страницы рядом с фильтрами Type/Language. Опции: `All` / `Coach` / `Standard`. Состояние фильтра: `Mode: Coach` выбран → в таблице только Coach-проекты.

### Блок 2: Wizard Step 3 (Coach Mode Checkbox)

**Задача:** Минимально дополнить существующий Step 3 «Avatar Instructions» без создания нового шага.
**Элементы:**
- **Checkbox «Coach Mode»:** Включить в форму (стандартный чекбокс). При активации разворачивается Learner Role Selector и меняется левый sidebar.
- **Learner Role Selector:** Dropdown или карточки-пресеты с ролями (Account Executive, Sales Engineer, Customer Success Manager, Business Development Representative). Подпись роли внизу переключается: `Аватар` → `Учень`.
- **Sidebar:** При включении Coach Mode добавляются 2 новых шага (`2 Coach Q&A Set` и `3 Coach Settings`), выделенных цветом (amber). Шаг Knowledge Base смещается на позицию 6.

### Блок 3: Wizard Step 4 (Coach Q&A Set — NEW)

**Задача:** Новый шаг визарда (после Instructions) для независимого наполнения банка Q&A (scope `coach_qa`).
**Элементы:**
- **Источник контента (Content Source):** Копия KB-интерфейса (Upload file, Add URL, Add text).
- **Параметры генерации:** Поле «Количество вопросов», dropdown «Сложность» (Easy/Medium/Hard), мультиселект/чипы «Тип вопросов» (Pricing/Objection...). Кнопка `🤖 Generate & add to Set`.
- **Test Set:** Таблица/карточки с Q&A (вопрос, ответ, категория). Кнопки Edit, Delete, Add manually (открывает форму), Import CSV. Показаны состояния: заполненное, пустое, loading.

### Блок 4: Wizard Step 5 (Coach Settings — NEW)

**Задача:** Настройка поведения тренировки.
**Элементы:**
- **Тип теста (Test Type):** Radio/segment control — `Text / Voice`, `Text + Слайд`, `Только слайд` (пока disabled/preview для Wave 3).
- **Выбор Q&A:** Список категорий с тоглами/чекбоксами + поле `Questions per session`.
- **Тайминг вопросов:** Radio/dropdown — `До слайда` / `На слайде` / `После слайда` / `Без слайдів (Quiz Mode)`.
- **Три флага видимости:** Чекбоксы — `Show immediate feedback`, `Show correct answer`, `Allow skip`.
- **Пороговый балл (Passing Score):** Числовое поле `%`.
- **Отчётность:** Чекбоксы `Email report` / `Slack notification` / `HubSpot sync`.

### Блок 5: Editor — Top Nav и Правая панель

**Задача:** Добавить навигацию для Coach-проектов в редактор.
**Элементы:**
- **Top Navigation:** Два новых пункта после Goals (`Coach Q&A Set` и `Coach Settings`), визуально выделенные. Открывают такой же интерфейс, как в Wizard.
- **Coach Q&A Tab (Правая панель):** Вкладка со списком вопросов для текущего слайда. Стрелки `▲` / `▼` для сортировки. Кнопка `+ Add Q&A from Set` (заменяет `Generate for slide`).

### Блок 6: Editor Preview / Train Mode (AI asks)

**Задача:** Добавить в Preview режим тренировки с автоматической проверкой ответов тренера.
**Элементы:**
- **Train Mode Banner:** Sticky top-полоса с чекбоксом `Train Mode` и sub-toggle `AI asks ↔ Manual`.
- **Режим «AI asks»:** Аватар задаёт вопросы (нумерация `Q5/12` + роль). Тренер вводит эталонный ответ. После отправки появляется зелёный auto-hide бейдж: `✓ SAVED · Q6 записано у Test Set`.

### Блок 7: Editor Preview / Train Mode (Manual)

**Задача:** Форма ручного ввода Q&A вместо чата.
**Элементы:**
- **Форма Manual:** Textarea для вопроса, textarea для правильного ответа. Dropdowns для Категории и Сложности. Кнопка `+ Add to Test Set (Q9)`.
- **Список недавних:** Последние 3-5 добавленных Q&A с кнопками Edit/Delete.

## Definition of Done для Дизайна

✅ Отрисован Project List с колонкой Mode (🏋 / —) и dropdown-фильтром.

✅ Отрисован Wizard Step 3: чекбокс Coach Mode, Learner Role Selector, и 2 состояния sidebar (выкл./вкл. с янтарными новыми шагами).

✅ Отрисован Wizard Step 4: источник контента, параметры генерации, Test Set (состояния: пусто, loading, список Q&A).

✅ Отрисован Wizard Step 5: Test Type, выбор Q&A, тайминг, три флага, Passing Score, чекбоксы отчётности.

✅ Отрисован Editor: пункты в Top Nav и Coach Q&A вкладка в правой панели.

✅ Отрисован Editor Preview / Train Mode (AI asks): banner, sub-toggle, диалог и бейдж «✓ SAVED».

✅ Отрисован Editor Preview / Train Mode (Manual): форма ввода и список недавних.

✅ Макеты финализированы в Figma, построены на реальных компонентах продукта, готовы к передаче в разработку.
