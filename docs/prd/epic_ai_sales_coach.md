# Epic: AI Sales Coach & Train Mode

**By yevhen.shaforostov**

## User Story

Як презентатор, я хочу створити AI Chat Avatar у режимі Coach Mode, щоб використовувати його для навчання та тестування продавців.

AI-аватар може виконувати роль покупця, клієнта або іншого співрозмовника, ставити запитання, перевіряти знання продукту, оцінювати відповіді користувача та допомагати відпрацьовувати сценарії продажів.

Coach Mode може використовуватися як із презентацією, так і без неї.

Я також хочу навчати аватара новим питанням, правильним відповідям та сценаріям, щоб повторно використовувати їх під час навчання інших співробітників.

## Business Value

- Автоматизація навчання менеджерів із продажу.
- Скорочення часу роботи тренерів.
- Автоматична перевірка знань продукту.
- Відпрацювання роботи із запереченнями.
- Повторне використання тренувальних сценаріїв.
- Масштабоване навчання команд.
- Побудова корпоративної бібліотеки питань для навчання.

## Current Problems

Наразі система не дозволяє:
- створювати AI Coach поверх Chat Avatar;
- проводити рольові тренування продавців;
- навчати аватара питанням та відповідям;
- повторно використовувати створені питання;
- прив'язувати питання до конкретних слайдів;
- редагувати Coach після створення Chat Avatar;
- використовувати один Coach для різних сценаріїв навчання.

## Scope

### 1. Coach Mode
Coach Mode є окремим режимом Chat Avatar, а не окремим типом проєкту.
Після ввімкнення Coach Mode користувач отримує можливість створити навчальний AI-аватар.
Coach може працювати:
- із презентацією;
- без презентації.

### 2. Learner Role
Після ввімкнення Coach Mode користувач вибирає роль співрозмовника.
Приклади (синхронізовано з поточним кодом):
- Buyer
- Customer
- Recruiter
- Investor
- Student
- Manager

Саме роль визначає поведінку AI під час діалогу (`systemPrompt`).

### 3. Coach Question Storage
Coach використовує окреме сховище тренувальних питань.
Це не Knowledge Base і не RAG.
Question Storage містить незалежні Question & Answer записи, які можуть використовуватися у різних Coach-проєктах.
Кожен запис містить:
- Question (`questionText`)
- Correct Answer (`expectedAnswer`)
- Role / Persona
- Question Type (`product`, `price`, `objection` тощо)
- Expected Slide ID (опціонально)

### 4. Coach Question Generation
Для створення питань використовується існуючий інтерфейс Knowledge Base.
Новий інтерфейс створювати не потрібно.
Користувач може:
- використовувати вже завантажений контент;
- використовувати існуючу Knowledge Base;
- додати новий контент;
- згенерувати питання через AI.

Після генерації користувач може:
- відредагувати питання;
- видалити питання;
- додати власні питання;
- зберегти питання у Coach Question Storage.

### 5. Manual Questions
Користувач може вручну створити питання.
Обов'язкові поля:
- Question
- Correct Answer
- Topic / Question Type

### 6. Question Types / Formats
Кожне питання належить до певної категорії (Product, Price, ROI, Competitors).
Формат проходження (Test Format):
- **MVP:** Text, Voice (text_voice).
- **Наступні етапи:** Text + Slide, Slide Only.

### 7. Coach Question Selection
Під час налаштування Coach користувач визначає, які питання використовуються під час проходження.
Можливі режими (`questionDelivery`):
- **Sequential:** Питання задаються у визначеному порядку.
- **Random:** Питання випадково вибираються зі сховища відповідно до фільтрів.
Під час одного проходження однакове питання не повинно повторюватися.

### 8. Coach Settings
Для Coach доступні лише налаштування, що стосуються самого контенту.
Доступні параметри:
- **Question Timing:** Before Presentation, During Slides, After Presentation. Якщо презентація відсутня, цей блок приховується.
- **Question Order:** Sequential, Random.
- **Feedback (Flags):** Show Correct Answer, Always Show Score, Immediate Feedback.

### 9. Slide Questions
Якщо Coach використовує презентацію, питання можуть бути прив'язані до конкретного слайду (`expectedSlideId`).
Для кожного слайду користувач може:
- додати конкретні питання;
- вибрати питання випадково зі Storage;
- використовувати фільтрацію.

### 10. Listener Coach Session
Під час проходження тренування AI:
- задає питання;
- слухає відповідь;
- оцінює відповідь (Evaluation Mode: auto, llm, manual);
- визначає Correct / Partial / Incorrect (`EvaluationResult`);
- показує пояснення (Feedback / Recommendations);
- показує правильну відповідь (якщо дозволено налаштуваннями);
- переходить до наступного питання.

### 11. Analytics
Coach формує дані для аналітики:
- Question
- User Answer
- AI Evaluation (Correctness, Product Knowledge, Objection Handling)
- Score
- Time (Duration)
- Feedback

Дані використовуються модулем Enrollment Analytics.
*(Примітка: в коді присутнє поле `passingScore` в налаштуваннях Coach, але згідно з правилами архітектури, розгорнута логіка Passing Score передається в Enrollments).*

## Dependencies
Epic залежить від реалізації:
- Universal Editor
- Chat Avatar Editor
- Presentation Editor
- Coach Question Storage
- Enrollment Analytics
- Knowledge Base
- AI Question Generation

Без Universal Editor повноцінна робота Coach неможлива.

## Future Scope
- **Train Mode:** Окремий режим навчання AI (AI Asks, користувач вводить правильну відповідь, питання додається у Storage).
- **Advanced Question Types:** Multiple Choice, Multiple Answers.
- **Custom Learner Roles:** Створення власних ролей.
- **Certification:** AI Certification.
- **Team Analytics:** Аналітика команди.
- **Scenario Builder:** Конструктор навчальних сценаріїв.
- **Courses:** Інтеграція з Courses.

## Out of Scope
У цьому епіку не реалізуються:
- Reporting (Email, Slack, HubSpot);
- Completion Rules;
- Enrollment Rules;
- Course Progress;
- Certificate Generation.

Цей функціонал належить до Epic Enrollments.

## Acceptance Criteria
- [ ] Користувач може увімкнути Coach Mode для Chat Avatar.
- [ ] Coach працює як із презентацією, так і без неї.
- [ ] Доступний вибір Learner Role (Buyer, Customer, Recruiter тощо).
- [ ] Для генерації питань використовується існуючий інтерфейс Knowledge Base.
- [ ] Створені питання зберігаються у Coach Question Storage (з прив'язкою до `expectedSlideId`).
- [ ] Користувач може вручну створювати та редагувати питання.
- [ ] Підтримуються типи питань MVP (Text, Voice).
- [ ] Питання можуть задаватися послідовно (`sequential`) або випадково (`random`).
- [ ] Повторення одного й того ж питання під час одного проходження не допускається.
- [ ] Питання можуть бути прив'язані до конкретних слайдів. Якщо презентація відсутня, налаштування Before/During/After Slides приховуються.
- [ ] AI оцінює відповіді користувача (LLM Evaluation) та формує Feedback.
- [ ] Результати (Session Logs, Score, Duration) передаються в модуль Enrollment Analytics.
- [ ] Реалізація Coach сумісна з Universal Editor і не порушує існуючий функціонал Chat Avatar та Projects.
