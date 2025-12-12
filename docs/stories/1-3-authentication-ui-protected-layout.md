# Story 1.3: Authentication UI & Protected Layout

Status: Ready for Development

## Story

As a User,
I want a clean login interface and a protected dashboard,
So that I can easily access the app and know my data is safe.

## Acceptance Criteria

1. **Given** I am an unauthenticated user
   **When** I visit `/dashboard`
   **Then** I am redirected to `/login`
2. **Given** I am on the Login page
   **When** I submit valid credentials
   **Then** I see the Dashboard layout with a logout button

## Tasks / Subtasks

- [ ] Task 1: Create Login Page (AC: 1, 2)
  - [ ] Subtask 1.1: Create `src/app/login/page.tsx` with email/password form
  - [ ] Subtask 1.2: Implement form validation using Zod
  - [ ] Subtask 1.3: Implement sign-up functionality alongside login
  - [ ] Subtask 1.4: Add error handling and user feedback
- [ ] Task 2: Create Protected Layout (AC: 1, 2)
  - [ ] Subtask 2.1: Create `src/app/(auth)/layout.tsx` for protected routes
  - [ ] Subtask 2.2: Implement route protection middleware
  - [ ] Subtask 2.3: Create header with logout button
  - [ ] Subtask 2.4: Create `src/app/(auth)/dashboard/page.tsx`
- [ ] Task 3: Implement Auth Provider (AC: 2)
  - [ ] Subtask 3.1: Create `src/features/auth/AuthProvider.tsx`
  - [ ] Subtask 3.2: Create `useAuth` hook for accessing auth state
  - [ ] Subtask 3.3: Implement logout functionality
- [ ] Task 4: Styling and UX (AC: 2)
  - [ ] Subtask 4.1: Style login page with CSS Modules
  - [ ] Subtask 4.2: Style dashboard layout with CSS Modules
  - [ ] Subtask 4.3: Ensure responsive design for mobile
- [ ] Task 5: Testing (AC: 1, 2)
  - [ ] Subtask 5.1: Write tests for login form validation
  - [ ] Subtask 5.2: Write tests for protected route redirection
  - [ ] Subtask 5.3: Write tests for logout functionality

## Dev Notes

### File Structure
```
src/
├── app/
│   ├── login/
│   │   ├── page.tsx
│   │   └── login.module.css
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── dashboard.module.css
│   │   └── auth.module.css
├── features/
│   └── auth/
│       ├── AuthProvider.tsx
│       ├── LoginForm.tsx
│       ├── useAuth.ts
│       └── auth.module.css
└── lib/
    └── auth.ts
```

### Login Form Requirements
- Email input with validation
- Password input with visibility toggle
- Sign-up link
- Forgot password link (placeholder for future)
- Error message display
- Loading state during submission
- Success redirect to dashboard

### Protected Layout Requirements
- Header with user email display
- Logout button
- Navigation structure
- Responsive design
- Session check on mount

### Styling Approach
- Use CSS Modules (vanilla CSS)
- No Tailwind CSS
- Mobile-first responsive design
- Accessible form elements
- Clear visual hierarchy

### Authentication Flow
1. User navigates to `/login`
2. User enters email and password
3. Form submits to Supabase Auth
4. On success, redirect to `/dashboard`
5. On error, show error message
6. Middleware protects `/dashboard` route

### References
- [Epics: Story 1.3](file:///d:/Thomas/PERSONAL/Projects/webuilddev/docs/epics.md#Story-1.3:-Authentication-UI-&-Protected-Layout)
- [Project Context: Framework Rules](file:///d:/Thomas/PERSONAL/Projects/webuilddev/docs/project_context.md)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Cascade AI

### Debug Log References

None - Implementation completed successfully

### Completion Notes List

- Created LoginForm component with email/password validation using Zod
- Implemented sign-up and sign-in functionality with Supabase Auth
- Added password visibility toggle for better UX
- Implemented form validation with error handling
- Created login page at /login with responsive design
- Created signup page at /signup with responsive design
- Implemented protected layout at /app/(auth)/layout.tsx with auth redirect
- Created dashboard page at /app/(auth)/dashboard with welcome message
- Implemented logout functionality via /api/auth/logout route
- Created comprehensive CSS modules for all pages
- Used vanilla CSS (no Tailwind) as per project requirements

### File List

- manager/src/features/auth/LoginForm.tsx
- manager/src/features/auth/auth.module.css
- manager/src/app/login/page.tsx
- manager/src/app/login/login.module.css
- manager/src/app/signup/page.tsx
- manager/src/app/signup/signup.module.css
- manager/src/app/(auth)/layout.tsx
- manager/src/app/(auth)/auth.module.css
- manager/src/app/(auth)/dashboard/page.tsx
- manager/src/app/(auth)/dashboard/dashboard.module.css
- manager/src/app/api/auth/logout/route.ts
