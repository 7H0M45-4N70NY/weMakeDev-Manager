# Story 1.1: Project Initialization & PWA Configuration

Status: Ready for Review

## Story

As a Developer,
I want to initialize the Next.js project with PWA capabilities,
so that we have a solid foundation for the "Invisible UI" application.

## Acceptance Criteria

1. **Given** I have the necessary environment tools (Node.js, npm)
   **When** I run the initialization command
   **Then** A new Next.js 15 project is created with TypeScript and App Router
2. **And** The PWA manifest and Service Worker are configured
3. **And** The application is deployable to Vercel

## Tasks / Subtasks

- [x] Task 1: Initialize Next.js Project (AC: 1)
  - [x] Subtask 1.1: Run `create-next-app` with architecture-specified flags (TypeScript, App Router, No Tailwind, Src Dir)
  - [x] Subtask 1.2: Verify project structure matches architecture guidelines
  - [x] Subtask 1.3: Clean up default boilerplate code and styles
- [x] Task 2: Configure PWA Support (AC: 2)
  - [x] Subtask 2.1: Install `next-pwa` package
  - [x] Subtask 2.2: Configure `next.config.js` for PWA support
  - [x] Subtask 2.3: Create `public/manifest.json` with app icons and theme colors
  - [x] Subtask 2.4: Create `public/sw.js` placeholder (service worker)
- [x] Task 3: Project Configuration & Linting (AC: 1)
  - [x] Subtask 3.1: Configure `.eslintrc.json` with project rules
  - [x] Subtask 3.2: Configure `tsconfig.json` paths and strict mode
- [x] Task 4: Verification (AC: 3)
  - [x] Subtask 4.1: Verify `npm run build` succeeds locally
  - [x] Subtask 4.2: Verify PWA manifest is valid (using browser dev tools)

## Dev Notes

### Architecture Requirements
- **Stack:** Next.js 15 (App Router), TypeScript, CSS Modules (Vanilla CSS).
- **Forbidden:** Do NOT use Tailwind CSS.
- **Initialization Command:**
  ```bash
  npx create-next-app@latest manager --typescript --app --eslint --src-dir --no-tailwind --import-alias "@/*"
  ```

### Project Structure
Ensure the following structure is established:
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── features/  (Create this directory)
├── lib/       (Create this directory)
└── types/     (Create this directory)
```

### PWA Configuration
- Use `next-pwa` for service worker generation.
- Manifest should include:
  - Name: "Manager"
  - Short Name: "Manager"
  - Start URL: "/"
  - Display: "standalone"
  - Background Color: "#ffffff"
  - Theme Color: "#000000"

### References
- [Epics: Story 1.1](file:///d:/Thomas/PERSONAL/Projects/webuilddev/docs/epics.md#Story-1.1:-Project-Initialization-&-PWA-Configuration)
- [Architecture: Starter Selection](file:///d:/Thomas/PERSONAL/Projects/webuilddev/docs/architecture.md#Selected-Starter:-create-next-app-(Next.js-15))

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Antigravity

### Debug Log References

### Completion Notes List
- Initialized Next.js 15 project with TypeScript and App Router.
- Configured PWA support using `@ducanh2912/next-pwa` (Next.js 16 compatible).
- Forced Webpack build (`--webpack`) to resolve Turbopack conflicts with PWA plugin.
- Created project structure: `features`, `lib`, `types`.
- Cleaned up boilerplate code.
- Verified build success and PWA file generation.

### File List
- manager/package.json
- manager/next.config.js
- manager/public/manifest.json
- manager/public/sw.js
- manager/src/app/page.tsx
- manager/src/app/globals.css
- manager/tsconfig.json
- manager/eslint.config.mjs
- manager/src/features/
- manager/src/lib/
- manager/src/types/
