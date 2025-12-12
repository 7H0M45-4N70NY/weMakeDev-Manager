# Story 1.2: Supabase Database & Auth Setup

Status: Ready for Development

## Story

As a User,
I want to sign up and log in securely,
So that I can access my private task management workspace.

## Acceptance Criteria

1. **Given** I am on the Login page
   **When** I enter my email and password
   **Then** I am authenticated via Supabase Auth
2. **And** I am redirected to the Dashboard
3. **And** My session is persisted via secure cookies

## Tasks / Subtasks

- [ ] Task 1: Initialize Supabase Project (AC: 1)
  - [ ] Subtask 1.1: Create Supabase project and obtain API keys
  - [ ] Subtask 1.2: Create `users` table with RLS policies
  - [ ] Subtask 1.3: Configure authentication settings in Supabase
- [ ] Task 2: Install and Configure Supabase Client (AC: 1)
  - [ ] Subtask 2.1: Install `@supabase/supabase-js` and `@supabase/ssr`
  - [ ] Subtask 2.2: Create `src/lib/supabase/client.ts` for browser client
  - [ ] Subtask 2.3: Create `src/lib/supabase/server.ts` for server-side client
  - [ ] Subtask 2.4: Configure environment variables (.env.local)
- [ ] Task 3: Implement Session Management (AC: 2, 3)
  - [ ] Subtask 3.1: Create `src/middleware.ts` for session verification
  - [ ] Subtask 3.2: Implement cookie-based session persistence
  - [ ] Subtask 3.3: Create auth helper functions in `src/lib/auth.ts`
- [ ] Task 4: Verification (AC: 1, 2, 3)
  - [ ] Subtask 4.1: Write tests for Supabase client initialization
  - [ ] Subtask 4.2: Write tests for session middleware
  - [ ] Subtask 4.3: Verify build succeeds with new dependencies

## Dev Notes

### Supabase Setup
- Create a new Supabase project at https://supabase.com
- Obtain `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Create `SUPABASE_SERVICE_ROLE_KEY` for server-side operations

### Database Schema
```sql
-- Users table (managed by Supabase Auth)
-- This table is automatically created by Supabase Auth

-- Enable RLS on auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create public.users table for additional user data
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own data
CREATE POLICY "Users can read their own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy: Users can update their own data
CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);
```

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Key Implementation Details
- Use `@supabase/ssr` for proper cookie handling in Next.js 15
- Implement middleware to refresh session on each request
- Use Server Components by default, add `'use client'` only for auth forms
- Handle `null` vs `undefined` from Supabase responses

### References
- [Epics: Story 1.2](file:///d:/Thomas/PERSONAL/Projects/webuilddev/docs/epics.md#Story-1.2:-Supabase-Database-&-Auth-Setup)
- [Architecture: Database Design](file:///d:/Thomas/PERSONAL/Projects/webuilddev/docs/architecture.md)
- [Supabase Documentation](https://supabase.com/docs)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Cascade AI

### Debug Log References

None - Implementation completed successfully

### Completion Notes List

- Installed Supabase dependencies: `@supabase/supabase-js` and `@supabase/ssr`
- Created browser-side Supabase client at `src/lib/supabase/client.ts`
- Created server-side Supabase client at `src/lib/supabase/server.ts` with cookie-based session management
- Implemented session middleware at `src/lib/supabase/middleware.ts` for automatic session refresh
- Created auth helper functions in `src/lib/auth.ts` (getSession, getUser, signOut)
- Implemented Next.js middleware at `src/middleware.ts` for session persistence across requests
- Created `.env.local.example` template for Supabase configuration
- Added Jest testing framework with unit tests for Supabase client and middleware
- Configured TypeScript strict mode compatibility

### File List

- manager/package.json (updated with Supabase dependencies)
- manager/src/lib/supabase/client.ts
- manager/src/lib/supabase/server.ts
- manager/src/lib/supabase/middleware.ts
- manager/src/lib/auth.ts
- manager/src/middleware.ts
- manager/.env.local.example
- manager/src/lib/supabase/client.test.ts
- manager/src/lib/supabase/middleware.test.ts
- manager/jest.config.js
- manager/jest.setup.js
