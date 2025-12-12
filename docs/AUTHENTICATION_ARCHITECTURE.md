# Authentication Architecture

**Project:** Manager - Task Management & AI Planning PWA  
**Date:** 2025-12-09  
**Version:** 1.0

---

## Overview

This document describes the authentication architecture implemented in Stories 1.2 and 1.3. It covers the session management flow, security considerations, and integration patterns.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / Client                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  LoginForm Component ('use client')                  │  │
│  │  - Email/Password Input                             │  │
│  │  - Zod Validation                                   │  │
│  │  - Supabase Auth Call                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Supabase Client (src/lib/supabase/client.ts)       │  │
│  │  - createBrowserClient()                            │  │
│  │  - Handles auth.signInWithPassword()                │  │
│  │  - Handles auth.signUp()                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────┐
        │   Supabase Auth Service              │
        │   - Validates credentials            │
        │   - Returns session tokens           │
        │   - Manages user records             │
        └──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Server                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Middleware (src/middleware.ts)                      │  │
│  │  - Runs on every request                            │  │
│  │  - Calls updateSession()                            │  │
│  │  - Refreshes session tokens                         │  │
│  │  - Sets secure cookies                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Supabase Server Client (src/lib/supabase/server.ts)│  │
│  │  - createServerClient()                             │  │
│  │  - Cookie-based session management                  │  │
│  │  - Server-side auth operations                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Protected Routes (src/app/(auth)/layout.tsx)       │  │
│  │  - Checks user session                              │  │
│  │  - Redirects to /login if not authenticated         │  │
│  │  - Renders dashboard with user data                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Session Management Flow

### 1. Sign-Up Flow

```
User fills signup form
    ↓
LoginForm validates with Zod
    ↓
Calls supabase.auth.signUp({email, password})
    ↓
Supabase creates user record
    ↓
Sends confirmation email
    ↓
Redirects to /login with message
    ↓
User confirms email (in Supabase dashboard or email link)
    ↓
User can now sign in
```

### 2. Sign-In Flow

```
User fills login form
    ↓
LoginForm validates with Zod
    ↓
Calls supabase.auth.signInWithPassword({email, password})
    ↓
Supabase validates credentials
    ↓
Returns session tokens (access_token, refresh_token)
    ↓
@supabase/ssr stores tokens in secure cookies
    ↓
Redirects to /dashboard
    ↓
Middleware refreshes session on request
    ↓
Protected layout checks user via getUser()
    ↓
Renders dashboard with user data
```

### 3. Session Refresh Flow

```
User makes request to protected route
    ↓
Middleware intercepts request
    ↓
Calls updateSession(request)
    ↓
Supabase Server Client reads cookies
    ↓
Calls supabase.auth.getUser()
    ↓
If token expired, refresh_token is used
    ↓
New tokens stored in cookies
    ↓
Request proceeds to route handler
```

### 4. Logout Flow

```
User clicks logout button
    ↓
Navigates to /api/auth/logout
    ↓
Route handler calls signOut()
    ↓
Supabase clears session
    ↓
Cookies are cleared
    ↓
Redirects to /login
```

---

## Key Components

### 1. Supabase Browser Client

**File:** `src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

**Usage in Client Components:**

```typescript
'use client';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const supabase = createClient();
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
}
```

**Key Points:**
- Only works in browser (client components)
- Uses anon key (limited permissions)
- Automatically manages tokens in localStorage
- @supabase/ssr integrates with cookies

### 2. Supabase Server Client

**File:** `src/lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored - middleware handles cookie setting
          }
        },
      },
    }
  );
};
```

**Usage in Server Components:**

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return <h1>Welcome, {user?.email}</h1>;
}
```

**Key Points:**
- Works in Server Components and API Routes
- Reads/writes cookies from request/response
- Can use service role key for admin operations
- Automatically refreshes expired tokens

### 3. Session Middleware

**File:** `src/lib/supabase/middleware.ts`

```typescript
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // This refreshes a user's session in case they have stale data
  await supabase.auth.getUser();

  return supabaseResponse;
}
```

**Key Points:**
- Runs on every request (via middleware)
- Refreshes session tokens automatically
- Updates cookies in response
- Prevents session expiration

### 4. Next.js Middleware

**File:** `src/middleware.ts`

```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)',
  ],
};
```

**Key Points:**
- Intercepts all requests (except static assets)
- Calls Supabase session update
- Ensures tokens are always fresh
- Runs before route handlers

### 5. Auth Helper Functions

**File:** `src/lib/auth.ts`

```typescript
import { createClient } from './supabase/server';

export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signOut() {
  const supabase = await createClient();
  return supabase.auth.signOut();
}
```

**Usage:**

```typescript
// In Server Components
import { getUser } from '@/lib/auth';

export default async function Page() {
  const user = await getUser();
  if (!user) redirect('/login');
  
  return <div>Welcome, {user.email}</div>;
}
```

### 6. Protected Layout

**File:** `src/app/(auth)/layout.tsx`

```typescript
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';

export default async function AuthLayout({ children }) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div>
      <header>
        <span>{user.email}</span>
        <a href="/api/auth/logout">Logout</a>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

**Key Points:**
- Server Component (no 'use client')
- Checks authentication at layout level
- Redirects unauthenticated users
- All child routes are protected

---

## Security Considerations

### 1. Token Storage

**Browser:** Tokens stored in secure, HTTP-only cookies (via @supabase/ssr)
- Not accessible to JavaScript
- Sent automatically with requests
- Protected against XSS attacks

**Server:** Tokens read from request cookies
- Never exposed to client
- Refreshed automatically
- Validated on each request

### 2. CSRF Protection

**Mechanism:** Same-site cookies
- Cookies only sent to same origin
- Prevents cross-site request forgery
- Enforced by browser

**Implementation:** @supabase/ssr handles automatically

### 3. Session Expiration

**Access Token:** Short-lived (1 hour)
- Expires quickly
- Reduces damage if compromised

**Refresh Token:** Long-lived (7 days)
- Used to get new access tokens
- Stored in secure cookie
- Rotated on refresh

**Automatic Refresh:** Middleware refreshes on each request
- User never sees expiration
- Seamless experience

### 4. Row Level Security (RLS)

**Database Level:** Supabase enforces RLS policies
- Users can only access their own data
- Policies written in PostgreSQL
- Enforced even if client is compromised

**Example Policy:**
```sql
CREATE POLICY "Users can read their own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);
```

### 5. Environment Variables

**Public Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Safe to expose
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Limited permissions

**Secret Variables:**
- `SUPABASE_SERVICE_ROLE_KEY` - Never expose to client
- Only used in server-side code

---

## Error Handling

### Authentication Errors

```typescript
try {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Handle specific errors
    if (error.message.includes('Invalid login credentials')) {
      setError('Email or password is incorrect');
    } else if (error.message.includes('Email not confirmed')) {
      setError('Please confirm your email first');
    } else {
      setError(error.message);
    }
  }
} catch (err) {
  setError('An unexpected error occurred');
}
```

### Session Errors

```typescript
export default async function ProtectedPage() {
  const user = await getUser();

  if (!user) {
    // User not authenticated
    redirect('/login');
  }

  // User is authenticated, safe to proceed
  return <div>Welcome, {user.email}</div>;
}
```

---

## Testing Strategy

### Unit Tests

**Supabase Client:**
```typescript
describe('Supabase Client', () => {
  it('should create a client instance', () => {
    const client = createClient();
    expect(client).toBeDefined();
  });
});
```

**Middleware:**
```typescript
describe('Session Middleware', () => {
  it('should refresh session on request', async () => {
    const request = new NextRequest('http://localhost:3000/dashboard');
    const response = await updateSession(request);
    expect(response).toBeInstanceOf(NextResponse);
  });
});
```

### Integration Tests (Manual)

1. **Sign Up Flow**
   - Create new account
   - Verify email confirmation email sent
   - Confirm email in Supabase dashboard
   - Sign in with new credentials

2. **Session Persistence**
   - Sign in
   - Refresh page
   - Verify still logged in
   - Check cookies in DevTools

3. **Token Refresh**
   - Sign in
   - Wait for token expiration (or mock)
   - Make request
   - Verify new token issued

4. **Protected Routes**
   - Try accessing /dashboard without auth
   - Verify redirect to /login
   - Sign in
   - Verify access to /dashboard

5. **Logout**
   - Sign in
   - Click logout
   - Verify redirect to /login
   - Verify cookies cleared
   - Try accessing /dashboard
   - Verify redirect to /login

---

## Performance Considerations

### 1. Middleware Overhead

**Impact:** Minimal
- Middleware runs on every request
- Session refresh is fast (cached)
- No database queries for session check

**Optimization:** Middleware only runs on necessary routes
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### 2. Cookie Size

**Impact:** Minimal
- Session tokens are small (~1KB)
- Sent with every request
- Negligible bandwidth impact

### 3. Server Component Rendering

**Impact:** Minimal
- `getUser()` uses cached session
- No additional database queries
- Fast server-side rendering

---

## Troubleshooting

### Issue: "Session not persisting"

**Causes:**
- Middleware not configured
- Cookies disabled in browser
- Supabase credentials incorrect

**Solution:**
1. Verify middleware.ts exists and is configured
2. Check browser DevTools → Application → Cookies
3. Verify .env.local has correct credentials

### Issue: "Redirect loop on /login"

**Causes:**
- getUser() always returns null
- Supabase credentials incorrect
- User not properly authenticated

**Solution:**
1. Check Supabase dashboard for user records
2. Verify credentials in .env.local
3. Check browser console for errors

### Issue: "CORS errors"

**Causes:**
- Supabase URL incorrect
- Origin not allowed in Supabase

**Solution:**
1. Verify NEXT_PUBLIC_SUPABASE_URL is correct
2. Check Supabase project settings for allowed origins
3. Add localhost:3000 to allowed origins

---

## Future Enhancements

### 1. Multi-Factor Authentication (MFA)

```typescript
// Future implementation
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
  options: {
    shouldCreateUser: false,
  },
});

if (data.session?.user.user_metadata.mfa_enabled) {
  // Prompt for MFA code
}
```

### 2. Social Authentication

```typescript
// Future implementation
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${location.origin}/auth/callback`,
  },
});
```

### 3. Password Reset

```typescript
// Future implementation
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${location.origin}/auth/callback?type=recovery`,
});
```

---

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase SSR Pattern](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## Summary

The authentication architecture provides:

✅ **Secure Session Management**
- Cookie-based sessions with automatic refresh
- Token rotation and expiration handling
- CSRF protection

✅ **Server-Side Rendering Support**
- Server Components can access user data
- Middleware-level session validation
- No client-side auth state management

✅ **Developer Experience**
- Simple helper functions (getUser, getSession, signOut)
- Type-safe with TypeScript
- Comprehensive error handling

✅ **Security Best Practices**
- HTTP-only cookies
- Automatic token refresh
- Row-level security enforcement
- Environment variable protection

The implementation follows Next.js 15 and Supabase best practices for modern web applications.
