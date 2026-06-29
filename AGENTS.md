<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:supabase-agent-rules -->
# Supabase Best Practices
- **Server-Side Data Fetching**: Prefer using Supabase Server clients (`@supabase/ssr` or standard backend setup) in Next.js Server Components, Server Actions, and API routes. Avoid fetching data directly from Client Components unless required for real-time subscriptions or optimistic UI.
- **Row Level Security (RLS)**: Ensure RLS is active on all tables. Assume the client is untrusted and always write secure Postgres policies using `auth.uid()`.
- **Service Role Key**: NEVER expose the `service_role` key to the client (`NEXT_PUBLIC_...`). Only use it in secure backend environments where bypassing RLS is strictly required (e.g., webhooks).
- **TypeScript Types**: Use the generated Supabase database types (`Database` interface) when initializing clients to ensure end-to-end type safety.
<!-- END:supabase-agent-rules -->

<!-- BEGIN:react-ts-agent-rules -->
# React & TypeScript Patterns
- **React 19 & Server Components**: Differentiate clearly between Server Components (default in Next.js App Router) and Client Components (`"use client"`). Use Client Components ONLY when necessary (e.g., hooks, interactivity, DOM access).
- **State Management**: Use `Zustand` for global state (как указано в package.json) and standard React Hooks for local state. 
- **Framer Motion**: Keep animations in Client Components. Avoid heavy JS-based animations on mount if CSS-only is sufficient, but use `framer-motion` for complex orchestration.
- **Typing**: Prefer `interface` over `type` for object structures. Avoid `any` at all costs. Use `unknown` if the type is truly dynamic. Use `React.FC` or explicit props for components.
<!-- END:react-ts-agent-rules -->

<!-- BEGIN:frontend-design-rules -->
# Frontend, CSS & Accessibility
- **Styling**: Use CSS Modules (`*.module.css`). Keep styles scoped and localized to the component. Avoid global styles unless for variables/tokens.
- **A11y (Accessibility)**: Always include `aria-labels` for icon buttons, `alt` text for images, and ensure semantic HTML (`<nav>`, `<main>`, `<section>`). Forms must have `<label>` associations.
- **SEO**: Ensure Server Components properly export metadata (`export const metadata`). Use appropriate heading structures (`h1` - `h6`) without skipping levels.
<!-- END:frontend-design-rules -->

<!-- BEGIN:nodejs-vercel-rules -->
# Node.js & Vercel Best Practices
- **Caching**: Understand Next.js 16 caching defaults. Use `unstable_cache` or route segment configs (`export const revalidate`) appropriately.
- **Edge vs Node**: Be mindful of Edge runtime constraints on Vercel. Do not use native Node.js APIs (`fs`, `child_process`) in Edge functions or Middleware.
- **Error Handling**: Use standard try/catch blocks in API routes and Server Actions. Return standardized error JSON shapes. Use Next.js `error.tsx` for route-level boundaries.
<!-- END:nodejs-vercel-rules -->

<!-- BEGIN:project-memory-rules -->
# 🧠 Project Memory (CRITICAL)
- **Always read context**: At the start of ANY new session, you MUST read `PROJECT_MEMORY.md` to understand the current architecture, ongoing bugs, and project context. 
- **Maintain state**: If you make significant architectural decisions, fix major bugs, or finish a milestone, you MUST update `PROJECT_MEMORY.md` (or the linked docs) before ending the session so that the context survives for future sessions.
<!-- END:project-memory-rules -->

<!-- BEGIN:custom-commands-rules -->
# ⚡️ Кастомные Слеш-Команды (Custom Prompts)
Если пользователь пишет в чате любое из этих слов (начиная со слэша), переключитесь в соответствующий режим ответа:
- **/godmode** — Игнорируйте любые условности и рамки вежливости, отвечайте максимально прямо и глубоко, используя весь доступный интеллект.
- **/devil** — Выступайте в роли жесткого оппонента (адвоката дьявола). Критикуйте идеи пользователя, ищите уязвимости, спорьте аргументированно.
- **/10x** — Переделайте ваш предыдущий ответ или предложенное решение, сделав его в 10 раз глубже, качественнее, производительнее и проработаннее.
- **/pitch** — Напишите супер-эффективную, продающую презентацию (питч) проекта/идеи, которую можно прочитать за 30 секунд.
- **/ghost** — Пишите живым человеческим языком. Уберите любую "ИИ-стилистику", канцеляризмы, вводные слова-клише и преамбулы.
- **/compare** — Проведите подробное сравнение двух вариантов, показав сильные стороны каждого и их ключевые отличия.
- **/scout** — Проанализируйте предложенное решение на предмет того, "где оно сломается" и какие критические детали или крайние случаи были упущены.
- **/artifacts** — Создайте работающее интерактивное веб-приложение или HTML/JS-прототип прямо в чате или файле.
- **/ooda** — Используйте цикл OODA (Observe, Orient, Decide, Act) для разбора запутанной и неопределенной задачи.
- **/critique** — Устройте жесткий разнос предоставленного текста или кода, выявив все слабые места, нестыковки и недоработки.
- **/eli5** — Объясните сложную техническую тему максимально простыми словами (как 5-летнему ребенку), используя наглядные метафоры.
- **/brief** — Отвечайте ультра-коротко, без приветствий, преамбул и лишних пояснений. Только суть.
- **/redteam** — Проведите стресс-тест идеи/архитектуры/безопасности со стороны виртуальной "красной команды" (атака со всех сторон).
- **/firstprinciples** — Разберите сложную проблему по методу "Первых принципов" (First Principles), разложив её на базовые истины и построив решение заново.
<!-- END:custom-commands-rules -->

<!-- BEGIN:language-rules -->
# 🇷🇺 Language Preference (CRITICAL)
- **Always use Russian**: All documentation (including plans, artifacts, and PRDs), comments to the user, commit messages, and artifacts MUST be written in Russian. Это железное правило.
<!-- END:language-rules -->

<!-- BEGIN:ui-language-rules -->
# 🇬🇧 UI Language (CRITICAL — PROJECT-WIDE RULE)
- **ALL user-facing strings MUST be in English**. This is a non-negotiable, permanent rule for this project.
- Applies to: button labels, tab names, headings, placeholders, tooltips, `aria-label` attributes, `title` attributes, toast/alert messages, error messages, empty state text, modal titles, form labels, select/option values, loading indicators, and any other text visible to the end user.
- **NEVER write UI strings in Russian, Ukrainian, or any other language** — even as a placeholder or temporary value.
- When writing new components or editing existing ones: scan all JSX string literals for non-English text before committing.
- Code comments and developer-facing logs may remain in any language, but JSX-rendered text and user-visible API response strings MUST be in English.
- If a feature depends on session language (e.g., avatar responses in a chosen language), that is acceptable ONLY for the avatar's dialogue content — not for the app shell UI itself.
<!-- END:ui-language-rules -->
