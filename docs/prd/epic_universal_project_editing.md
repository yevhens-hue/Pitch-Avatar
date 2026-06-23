# Epic: Universal Project Editing with Menu Items

## Description

**User Story**
Я як презентатор хочу редагувати всі типи проєктів через єдиний редактор з універсальним меню, щоб не проходити повторно всі кроки візардів для внесення змін та мати швидкий доступ до всіх налаштувань проєкту в одному місці.

Я хочу, щоб набір пунктів меню автоматично змінювався залежно від типу проєкту, тарифного плану або доступного функціоналу.

**Business Value**
- Єдиний інтерфейс редагування для всіх типів проєктів.
- Спрощення роботи користувачів.
- Скорочення кількості візардів.
- Повторне використання існуючого функціоналу редактора презентацій.
- Спрощення подальшого розвитку Templates, Import, Assignments та AI Avatar.
- Можливість швидкого доступу до будь-якого налаштування без проходження всього процесу створення проєкту.

**Problems**
Зараз різні типи проєктів використовують різні інтерфейси редагування.
- Презентації мають редактор із меню.
- AI Chat Avatar використовує окремий візард.

Через це:
- користувачі змушені проходити кілька кроків для внесення простих змін;
- налаштування розташовані в різних місцях;
- різний UX для різних типів проєктів;
- складно масштабувати нові типи проєктів.

## Scope

### Універсальний редактор проєктів
Використати існуючий редактор презентацій як базовий редактор для всіх типів проєктів.

Підтримувані типи:
- Presentation
- AI Chat Avatar
- AI Chat Avatar with Slides
- Widget
- Video Project
- Майбутні типи проєктів

### Universal Menu
Редактор підтримує набір універсальних пунктів меню:
- Slides
- Settings
- Avatar
- Instructions
- Knowledge Base
- Import
- Share / Assign
- Create with AI (future)
- Templates (future)

### Dynamic Menu Visibility
Пункти меню можуть автоматично приховуватись залежно від:
- типу проєкту;
- тарифного плану;
- налаштувань адміністратора;
- доступності функціоналу.

**Приклади:**
- **Presentation:** Slides, Settings, Instructions, Knowledge Base, Import, Share / Assign
- **AI Chat Avatar:** Avatar, Instructions, Knowledge Base, Settings, Import, Share / Assign
- **Widget:** Avatar, Instructions, Knowledge Base, Settings, Share / Assign

### Slides
Використовується поточний редактор слайдів презентації.
Для типів проєктів без слайдів пункт не відображається.

### Settings
Об'єднання існуюх налаштувань з різних частин системи.
Містить:
- **Project Information:** Project Name, Language, Author, Project Icon
- **Access Settings:** Public, Private, Password Protected, Existing Access Settings
- **Avatar Settings:** Avatar displays as video, Avatar speaks response aloud, Users can ask questions by voice

### Avatar
Використовує існуючий функціонал AI Chat Avatar Wizard.
Містить:
- Avatar Selection
- Voice Selection
- Provider Settings
- Avatar Parameters
*(Без дублювання назви проєкту).*

### Instructions
Використовує існуючий функціонал налаштування інструкцій AI Chat Avatar.
Містить усі поточні параметри інструкцій.

### Knowledge Base
Використовує існуючий функціонал Knowledge Base.
Містить:
- Documents
- URLs
- Crawl Results
- Knowledge Sources

### Import
Новий пункт меню.
Підтримує:
- Upload Presentation (PPTX, PDF)
- Upload Video (MP4, Video Sources)

Дозволяє оновлювати контент існуючого проєкту без створення нового.

### Share / Assign
Окремий пункт меню для роботи з:
- Web Links
- Assignments
- Enrollments
- Analytics Access

### Tabs Support
Всередині пунктів меню можуть використовуватись вкладки (Tabs).
Приклад:
- **Avatar:** General, Voice Settings, Provider Settings
- **Settings:** Information, Access, Advanced

### Advanced Settings
Для зменшення кількості параметрів на екрані.
За замовчуванням показуються лише основні параметри.
Додаткові налаштування відкриваються через кнопку: `Advanced`.

## Future Scope

### Create with AI
Створення проєктів за допомогою AI.

### Templates
Вибір шаблонів безпосередньо в редакторі.
Підтримка: пошуку, сортування, фільтрації по типу проєкту.

### Admin Configurable Menu
У майбутньому набір пунктів меню та їх порядок можуть керуватися адміністратором через Project Wizards Configuration.

## Acceptance Criteria
- [ ] усі типи проєктів використовують єдиний редактор;
- [ ] меню автоматично змінюється залежно від типу проєкту;
- [ ] Slides відображається лише для проєктів зі слайдами;
- [ ] Avatar відображається лише для проєктів з аватаром;
- [ ] Settings об'єднує поточні налаштування More, Information та Access;
- [ ] працює Import для Presentation та Video;
- [ ] працює Knowledge Base;
- [ ] працює Instructions;
- [ ] працює Share / Assign;
- [ ] підтримуються Tabs;
- [ ] підтримується Advanced Visibility;
- [ ] існуючий функціонал Presentation Editor не порушений.
