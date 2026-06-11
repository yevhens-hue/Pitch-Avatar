# Product Management AI Skills

This document contains a list of custom AI agent skills configured for product management workflows. These skills are located in the `.agents/skills/` directory and can be triggered by asking the AI agent to perform specific tasks.

## Skills Directory

| Skill Name | Capability | Trigger Examples (Prompts) | Location |
| :--- | :--- | :--- | :--- |
| **`product-feature-prioritization`** | Prioritize features and backlog items using frameworks like **RICE**, **ICE**, **MoSCoW**, or **Kano**. Calculates scores and generates ranked lists. | *«Приоритизируй список этих фич по RICE...»*<br>*«Разбей наши задачи на Must/Should/Could по MoSCoW...»* | [SKILL.md](file:///Users/yevhen/.gemini/antigravity/scratch/projects/github/Pitch-Avatar/.agents/skills/product-feature-prioritization/SKILL.md) |
| **`product-spec-generator`** | Generate comprehensive **PRDs** (Product Requirements Documents), write User Stories, draft Acceptance Criteria (Given/When/Then), and identify UX/UI edge cases. | *«Напиши PRD для фичи интеграции с календарем...»*<br>*«Распиши приемочные критерии для создания квоты...»* | [SKILL.md](file:///Users/yevhen/.gemini/antigravity/scratch/projects/github/Pitch-Avatar/.agents/skills/product-spec-generator/SKILL.md) |
| **`ab-testing-planner`** | Plan **A/B tests**, calculate minimum sample sizes and duration, formulate hypotheses, and evaluate experimental results for statistical significance. | *«Рассчитай, сколько трафика нужно для A/B теста конверсии...»*<br>*«Посчитай стат. значимость результатов теста...»* | [SKILL.md](file:///Users/yevhen/.gemini/antigravity/scratch/projects/github/Pitch-Avatar/.agents/skills/ab-testing-planner/SKILL.md) |
| **`user-feedback-analyst`** | Analyze customer feedback, app reviews, and support tickets. Categories feedback into key buckets, computes **sentiment trends**, and highlights main pain points. | *«Проанализируй этот список отзывов и выдели 3 главные проблемы...»*<br>*«Сделай сентимент-анализ выгрузки из поддержки...»* | [SKILL.md](file:///Users/yevhen/.gemini/antigravity/scratch/projects/github/Pitch-Avatar/.agents/skills/user-feedback-analyst/SKILL.md) |
| **`competitor-research`** | Research **competitors** using web search, compile key feature sets, pricing models, user reviews, and build comparison matrices. | *«Сравни тарифы и фичи нашего продукта с сервисом X...»*<br>*«Сделай анализ сильных и слабых сторон конкурента Y...»* | [SKILL.md](file:///Users/yevhen/.gemini/antigravity/scratch/projects/github/Pitch-Avatar/.agents/skills/competitor-research/SKILL.md) |
| **`changelog-generator`** | Parse git logs, PR descriptions, and task lists, translating them into friendly, customer-facing **Changelogs** and **Release Notes**. | *«Собери changelog по последним коммитам в репозитории...»*<br>*«Напиши release notes для наших пользователей...»* | [SKILL.md](file:///Users/yevhen/.gemini/antigravity/scratch/projects/github/Pitch-Avatar/.agents/skills/changelog-generator/SKILL.md) |

## How to Use

When communicating with the AI agent, you can explicitly mention the skill name, and the agent will load the respective guidelines to ensure correct formatting and implementation.

Example:
> *"Используй `product-spec-generator` и напиши PRD для..."*
