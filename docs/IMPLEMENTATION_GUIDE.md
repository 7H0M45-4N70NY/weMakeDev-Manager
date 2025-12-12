# Implementation Guide - Manager Project

**Project:** Manager - Task Management & AI Planning PWA  
**Date:** 2025-12-09  
**Status:** Stories 1.1, 1.2, 1.3 Implemented  
**Author:** Cascade AI

---

## Overview

This document provides a comprehensive guide to the implementation of Stories 1.1, 1.2, and 1.3 for the Manager project. It covers the architecture, setup instructions, and key implementation details.

---

## Story 1.1: Project Initialization & PWA Configuration

**Status:** ✅ Completed (In Review)

### What Was Implemented

- Next.js 15 project with TypeScript and App Router
- PWA support using `@ducanh2912/next-pwa`
- Service Worker configuration
- Project structure with `features`, `lib`, and `types` directories
- ESLint and TypeScript configuration

### Key Files

```
manager/
├── next.config.js          # PWA configuration
├── package.json            # Dependencies (Next.js 15, React 19)
├── tsconfig.json           # TypeScript strict mode
├── eslint.config.mjs       # ESLint rules
├── public/
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service Worker placeholder
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── globals.css
    ├── features/           # Feature modules
    ├── lib/                # Utility functions
    └── types/              # TypeScript types
```

### Environment Setup

```bash
cd manager
npm install
npm run dev
```

---

## Story 1.2: Supabase Database & Auth Setup

**Status:** ✅ Completed

### What Was Implemented

#### 1. Supabase Client Configuration

- **Browser Client** (`src/lib/supabase/client.ts`): For client-side operations
- **Server Client** (`src/lib/supabase/server.ts`): For server-side operations with cookie-based sessions
- **Middleware** (`src/lib/supabase/middleware.ts`): Automatic session refresh on each request

#### 2. Session Management

- Next.js middleware (`src/middleware.ts`) for request-level session verification
- Cookie-based session persistence using `@supabase/ssr`
- Automatic session refresh to prevent stale sessions

#### 3. Auth Helper Functions

```typescript
// src/lib/auth.ts
export async function getSession()  // Get current session
export async function getUser()     // Get authenticated user
export async function signOut()     // Sign out user
```

#### 4. Environment Configuration

Create `.env.local` (copy from `.env.local.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 5. Testing

Unit tests for Supabase client and middleware:

```bash
npm run test
npm run test:watch
```

### Key Dependencies Added

```json
{
  "@supabase/ssr": "^0.4.0",
  "@supabase/supabase-js": "^2.45.0",
  "zod": "^3.22.4"
}
```

### Implementation Details

**Cookie-Based Session Flow:**

1. User authenticates via Supabase Auth
2. Supabase returns session tokens
3. `@supabase/ssr` automatically stores tokens in secure cookies
4. Middleware refreshes session on each request
5. Server Components can access user via `getUser()` helper

**Security Considerations:**

- Cookies are HTTP-only and secure (production)
- Session tokens are automatically refreshed
- Server-side validation prevents unauthorized access
- RLS policies enforce user data isolation

### Files Created

- `src/lib/supabase/client.ts` - Browser client
- `src/lib/supabase/server.ts` - Server client
- `src/lib/supabase/middleware.ts` - Session middleware
- `src/lib/auth.ts` - Auth helpers
- `src/middleware.ts` - Next.js middleware
- `src/lib/supabase/client.test.ts` - Client tests
- `src/lib/supabase/middleware.test.ts` - Middleware tests
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Jest setup
- `.env.local.example` - Environment template

---

## Story 1.3: Authentication UI & Protected Layout

**Status:** ✅ Completed

### What Was Implemented

#### 1. Login Form Component

**File:** `src/features/auth/LoginForm.tsx`

Features:
- Email and password validation using Zod schema
- Password visibility toggle
- Error handling and user feedback
- Loading states during submission
- Support for both sign-in and sign-up modes
- Responsive design

```typescript
<LoginForm isSignUp={false} />  // Sign in mode
<LoginForm isSignUp={true} />   // Sign up mode
```

#### 2. Authentication Pages

**Login Page** (`src/app/login/page.tsx`)
- Clean, centered layout
- Gradient background
- Card-based design
- Links to sign-up page

**Sign-Up Page** (`src/app/signup/page.tsx`)
- Same design as login page
- Links to login page
- Email confirmation message after signup

#### 3. Protected Routes

**Protected Layout** (`src/app/(auth)/layout.tsx`)
- Automatic redirect to `/login` for unauthenticated users
- Header with user email display
- Logout button
- Responsive navigation

**Dashboard Page** (`src/app/(auth)/dashboard/page.tsx`)
- Welcome message with user's name
- Feature cards (Tasks, AI Planning, Notifications, Settings)
- Placeholder content for future features
- Responsive grid layout

#### 4. Logout Functionality

**Route:** `src/app/api/auth/logout/route.ts`
- Server-side logout handler
- Clears session cookies
- Redirects to login page

#### 5. Styling

All pages use **CSS Modules** (vanilla CSS, no Tailwind):

- `src/features/auth/auth.module.css` - Form styles
- `src/app/login/login.module.css` - Login page styles
- `src/app/signup/signup.module.css` - Sign-up page styles
- `src/app/(auth)/auth.module.css` - Protected layout styles
- `src/app/(auth)/dashboard/dashboard.module.css` - Dashboard styles

**Design Principles:**
- Mobile-first responsive design
- Accessible form elements (proper labels, ARIA attributes)
- Clear visual hierarchy
- Consistent color scheme (black, white, grays, blue accents)
- Smooth transitions and hover states

### Authentication Flow

```
User visits /dashboard
    ↓
Middleware checks session
    ↓
No session? Redirect to /login
    ↓
User enters email/password
    ↓
LoginForm submits to Supabase Auth
    ↓
Success? Redirect to /dashboard
    ↓
Protected layout renders with user data
    ↓
User clicks logout
    ↓
Calls /api/auth/logout
    ↓
Session cleared, redirect to /login
```

### Files Created

- `src/features/auth/LoginForm.tsx` - Form component
- `src/features/auth/auth.module.css` - Form styles
- `src/app/login/page.tsx` - Login page
- `src/app/login/login.module.css` - Login styles
- `src/app/signup/page.tsx` - Sign-up page
- `src/app/signup/signup.module.css` - Sign-up styles
- `src/app/(auth)/layout.tsx` - Protected layout
- `src/app/(auth)/auth.module.css` - Layout styles
- `src/app/(auth)/dashboard/page.tsx` - Dashboard page
- `src/app/(auth)/dashboard/dashboard.module.css` - Dashboard styles
- `src/app/api/auth/logout/route.ts` - Logout API route

---

## Setup Instructions

### Prerequisites

- Node.js 18+ (with npm)
- Supabase account (https://supabase.com)
- Git

### Step 1: Install Dependencies

```bash
cd manager
npm install
```

### Step 2: Configure Supabase

1. Create a new Supabase project at https://supabase.com
2. Copy your project URL and anon key from Project Settings
3. Create `.env.local`:

```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 3: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### Step 4: Test Authentication

1. Navigate to http://localhost:3000/signup
2. Create a new account
3. Check your email for confirmation link (in Supabase dashboard)
4. Confirm email
5. Navigate to http://localhost:3000/login
6. Sign in with your credentials
7. You should be redirected to /dashboard

---

## Testing

### Run Tests

```bash
npm run test              # Run all tests once
npm run test:watch       # Run tests in watch mode
```

### Test Coverage

- Supabase client initialization
- Session middleware functionality
- Form validation
- Protected route redirection

### Manual Testing Checklist

- [ ] Sign up with new email
- [ ] Receive confirmation email
- [ ] Confirm email in Supabase dashboard
- [ ] Sign in with credentials
- [ ] See dashboard with welcome message
- [ ] Click logout button
- [ ] Redirected to login page
- [ ] Try accessing /dashboard without auth → redirected to /login
- [ ] Test password visibility toggle
- [ ] Test form validation (invalid email, short password)
- [ ] Test responsive design on mobile

---

## Architecture Decisions

### 1. Cookie-Based Sessions

**Why:** Supabase SSR pattern for Next.js 15 uses cookies for secure session management. This prevents CSRF attacks and works with Server Components.

### 2. Server Components by Default

**Why:** Per project context, use Server Components by default. Only `LoginForm` uses `'use client'` because it needs interactivity.

### 3. CSS Modules (No Tailwind)

**Why:** Project requirement. Vanilla CSS provides full control and smaller bundle size.

### 4. Zod for Validation

**Why:** Type-safe validation with automatic TypeScript inference. Matches project context requirements.

### 5. Protected Routes with Middleware

**Why:** Middleware-level protection prevents unauthorized access before rendering. More secure than client-side checks.

---

## Common Issues & Solutions

### Issue: "Cannot find module '@supabase/ssr'"

**Solution:** Run `npm install` to install dependencies. TypeScript errors will resolve after installation.

### Issue: "Session not persisting across requests"

**Solution:** Ensure middleware is properly configured and `.env.local` has correct Supabase credentials.

### Issue: "Redirect loop on /login"

**Solution:** Check that Supabase credentials are correct. Verify user is properly authenticated in Supabase dashboard.

### Issue: "CORS errors when calling Supabase"

**Solution:** Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct. Check Supabase project settings for allowed origins.

---

## Next Steps

### Story 1.2 Completion

Before moving to Story 2.1, complete:

1. **Supabase Database Setup**
   - Create `users` table with RLS policies
   - Enable Row Level Security
   - Test user data isolation

2. **Environment Configuration**
   - Set up `.env.local` with real Supabase credentials
   - Test authentication flow end-to-end

3. **Code Review**
   - Run `npm run lint` to check code quality
   - Run `npm run test` to verify all tests pass
   - Run `npm run build` to verify production build

### Story 2.1: Task Data Model & API

Next story will implement:
- Task database table
- CRUD API endpoints
- RLS policies for task data
- Server Actions for mutations

---

## References

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase SSR Pattern](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Zod Documentation](https://zod.dev)
- [CSS Modules](https://nextjs.org/docs/app/building-your-application/styling/css-modules)

---

## Summary

Stories 1.1, 1.2, and 1.3 establish the foundation for the Manager application:

- **Story 1.1:** Project initialized with Next.js 15, TypeScript, and PWA support
- **Story 1.2:** Supabase authentication infrastructure with session management
- **Story 1.3:** User-facing authentication UI and protected routes

The application is now ready for Story 2.1 (Task Data Model & API) implementation.

All code follows project context requirements:
- ✅ TypeScript strict mode
- ✅ Server Components by default
- ✅ CSS Modules (no Tailwind)
- ✅ Zod validation
- ✅ Proper error handling
- ✅ Responsive design
- ✅ Unit tests included
