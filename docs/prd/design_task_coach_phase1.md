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

### Блок 2: Wizard Step 4 (Knowledge Base — Документы и их Назначение)

**Задача:** Подгрузка материалов с возможностью указания целевого назначения каждого документа.
**Элементы:**
- **Зона загрузки материалов:** Поддержка файлов, ссылок и текста.
- **Селектор назначения документа (Target Scope Selector):** Выпадающий список (Dropdown) или радио-кнопки при загрузке каждого документа/ссылки:
  - `General Avatar Base` (Общая База Знаний аватара) — используется для стандартных ответов аватара.
  - `Coach Mode (Q&A)` (Материалы для Coach режима) — используется для генерации проверочных Q&A вопросов.
- **Таблица загруженных источников:** Отображает имя, тип, дату и иконку/бейдж назначения (`General` / `Coach`).

### Блок 3: Wizard Step 5 (Coach — Единый шаг Coach Mode — NEW)

**Задача:** Единый шаг визарда (после Knowledge Base) для полного включения и настройки Coach режима.

**Структура экрана:**
- **Шапка шага (Header & Activation):**
  - **Checkbox «Enable Coach Mode»:** Основной переключатель активации режима. До включения подблоки ниже свернуты/скрыты.
  - **Learner Role Selector:** Dropdown или карточки ролей (Account Executive, Sales Engineer, Customer Success Manager, BDR). Меняет подпись под аватаром на `Ученик`.
- **Подраздел 1: Coach Q&A Set (Банк вопросов):**
  - **Параметры AI-генерации (Generation Parameters):**
    - Dropdown `Amount` (Количество вопросов: 5, 10, 15, Custom).
    - Dropdown `Difficulty` (Easy, Medium, Hard).
    - Dropdown `Language` (English, Ukrainian, Spanish, etc.).
    - Dropdown/Chips `Topic` (Price, Objection, Technical, Discovery, Product, ROI).
    - Кнопка `Generate & add to Set`.
  - **Test Set Table:** Карточки/таблица вопросов с возможностью ручного добавления (`+ Add manually`), редактирования, удаления и импорта CSV.
- **Подраздел 2: Coach Settings (Настройки сессии):**
  - Dropdown `Test Format` (Формат проверки): `Text / Voice`, `Text + Correct slide`*, `Only correct slide`*.
  - Dropdown `Question Order` (Порядок): `Sequential`, `Random N`.
  - Dropdown `Question Timing` (Тайминг)*: `Before presentation`, `On slides`, `After presentation`.
  - Input/Dropdown `Session Time Limit`: Ограничение времени сессии в минутах (`No limit`, 5 min, 10 min, Custom).
  - **Display Flags (Панель флагов):** Чекбоксы `Evaluate correctness immediately`, `Show correct answer`, `Show current score constantly`, `Show remaining questions`.

**ВАЖНО (Аватары без презентации):**
- Если аватар создается **без презентации** (например, Chat Avatar / Widget без слайд-дека), все опции с пометкой `*` (`On slides`, `Text + correct slide`, `Only correct slide`, `Question Timing`) **автоматически скрываются** из UI шага Coach.

*(Примечание: Настройки Passing Score и Reporting перенесены в Epic Enrollments).*

### Блок 5: Editor — Top Nav и Правая панель

**Задача:** Глубокая интеграция Coach-функционала в редактор проектов с учётом универсального визарда создания (Universal Wizard). Удобный доступ к глобальным настройкам и точечное управление вопросами на конкретных слайдах.

**Элементы:**
- **Top Navigation (Глобальные настройки проекта):**
  Мы используем логику универсального визарда. Вкладки `Coach Q&A Set` и `Coach Settings` добавляются в меню и приоритетно выводятся сразу после основной контентной вкладки (Slides или Avatar). Они открывают интерфейсы, идентичные шагам в Wizard (Step 4 и Step 5).
  Актуальный порядок вкладок в зависимости от типа проекта:
  - **Для презентаций (Slides/Presentation):** `Slides | Coach Q&A Set | Coach Settings | Settings | Avatar | Instructions | Knowledge Base | Import | Share/Assign`
  - **Для Chat Avatar:** `Avatar | Coach Q&A Set | Coach Settings | Instructions | Knowledge Base | Settings | Import | Share/Assign`
  - **Для Widget:** `Avatar | Coach Q&A Set | Coach Settings | Instructions | Knowledge Base | Settings | Share/Assign`

- **Coach Q&A Tab (Правая панель — Локальные настройки слайда):**
  Специальная вкладка в правой боковой панели, которая активируется для управления вопросами привязанными к **текущему выбранному слайду**.
  - **Список вопросов:** Отображает карточки вопросов, назначенных именно на этот слайд.
  - **Управление списком:** Внутри каждой карточки вопроса есть стрелки `↑` / `↓` для изменения локального порядка вопросов, а также крестик `×` для открепления вопроса от слайда.
  - **Добавление новых:** Кнопка `+ Add Q&A from Set` открывает шторку (модальное окно) со списком всех нераспределенных вопросов из общего сета, позволяя быстро добавить их на текущий слайд (заменяет старую кнопку `Generate for slide`).
  - *Примечание:* Глобальные настройки (такие как `Ask Order` и `When to Ask`) полностью вынесены в `Coach Settings` и в правой панели не дублируются.

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

✅ Отрисован Wizard Step 4 (Knowledge Base): интерфейс загрузки материалов с выпадающим списком целевого назначения (General Avatar KB vs Coach Mode).

✅ Отрисован Wizard Step 5 (Coach — Единый шаг):
  - Шапка с чекбоксом активации Coach Mode и выпадающим списком ролей ученика.
  - Подраздел 1 (Coach Q&A Set): параметры генерации с дропдаунами (Amount, Difficulty, Language, Topic) и таблица банка вопросов.
  - Подраздел 2 (Coach Settings): настройки формата теста, порядка вопросов, лимита времени и панели флагов с выпадающими списками.
  - Варианты отображения: для проектов с презентацией (со слайд-опциями) и без презентации (с автоматическим скрытием слайд-параметров).

✅ Отрисован Editor: пункты в Top Nav и Coach Q&A вкладка в правой панели.

✅ Отрисован Editor Preview / Train Mode (AI asks): banner, sub-toggle, диалог и бейдж «✓ SAVED».

✅ Отрисован Editor Preview / Train Mode (Manual): форма ввода и список недавних.

✅ Макеты финализированы в Figma, построены на реальных компонентах продукта, готовы к передаче в разработку.
