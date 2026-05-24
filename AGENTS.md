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
