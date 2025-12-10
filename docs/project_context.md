---
project_name: 'manager'
user_name: 'Thoma'
date: '2025-12-09'
sections_completed: ['technology_stack', 'implementation_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'critical_rules']
existing_patterns_found: 9
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.x (Strict Mode)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (SSR + Cookies)
- **Orchestration:** Kestra (Hybrid: DB + Webhooks)
- **Styling:** CSS Modules (Vanilla CSS)
- **Deployment:** Vercel (Serverless/Edge)
- **PWA:** `next-pwa` + `web-push` (VAPID)

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

- **Strict Mode:** ALWAYS enabled. No `any` types allowed.
- **Interfaces:** Use `interface` for object shapes, `type` for unions/primitives.
- **Async:** Use `async/await` exclusively (no `.then()` chains).
- **Exports:** Named exports preferred over default exports for components.
- **Null Handling:** Explicitly handle `null` vs `undefined` (Supabase returns `null`).

### Framework-Specific Rules (Next.js 15)

- **Server Components:** Default to Server Components. Add `'use client'` only when interactivity is needed.
- **Data Fetching:** Use `fetch` in Server Components or Server Actions. Avoid `useEffect` for data fetching.
- **Routing:** Use `next/link` for internal navigation.
- **Image Optimization:** ALWAYS use `next/image` with defined dimensions.
- **Server Actions:** Use for mutations. Validate inputs with Zod before processing.

### Testing Rules

- **Location:** Co-locate tests with components (`Component.test.tsx`).
- **Type:** Unit tests for logic/components, E2E for critical flows.
### Code Quality & Style Rules

- **Naming:**
  - Components: `PascalCase` (`TaskCard.tsx`)
  - Functions/Vars: `camelCase` (`getUserData`)
  - Database/JSON: `snake_case` (`user_id`)
  - Constants: `UPPER_SNAKE_CASE` (`MAX_RETRIES`)
- **Linting:** Follow `.eslintrc.json` rules. No unused vars, no console logs in production.
- **Comments:** Explain "WHY", not "WHAT". Document complex logic and hacks.

### Development Workflow Rules

- **Branching:** `feature/name`, `fix/name`, `chore/name`.
- **Commits:** Conventional Commits (`feat: add task list`, `fix: auth redirect`).
- **PRs:** Self-review before opening. Ensure CI passes.
- **Environment:** Use `.env.local` for secrets. NEVER commit secrets.

### Critical Don't-Miss Rules

- **Supabase RLS:** ALWAYS enable RLS on new tables. Add policies immediately.
- **Auth Context:** ALWAYS pass `user_id` to DB queries. Never trust client-side IDs for auth.
- **Edge Functions:** Kestra webhooks MUST verify auth tokens.
- **Hydration Mismatches:** Avoid random values (dates, math) during render. Use `useEffect` or fixed values.
- **PWA:** Service Worker updates must be handled gracefully (prompt user).


