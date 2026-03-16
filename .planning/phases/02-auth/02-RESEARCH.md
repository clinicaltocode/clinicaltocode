---
phase: 2
slug: auth
status: draft
created: 2026-03-15
---

# Phase 2 — Auth: Research

---

## Stack Decisions

All stack decisions carry forward from Phase 1 foundation. The following are specifically relevant to Phase 2:

| Concern | Decision | Rationale |
|---------|----------|-----------|
| Auth provider | Supabase Auth (built-in) | Same project as database; `auth.users` is directly FK-referenceable from `public.profiles`; email verification and session management are first-party; no separate vendor |
| SSR session handling | `@supabase/ssr` 0.5.x | Official package for Next.js App Router cookie-based sessions; replaces deprecated `@supabase/auth-helpers-nextjs`; required for server components, server actions, and middleware to see the authenticated user |
| Form validation | Zod 3.x + React Hook Form 7.x | Server Action input validation with `@hookform/resolvers`; matches the project-wide validation strategy |
| UI components | shadcn/ui (already installed) | Use `Form`, `Input`, `Button`, `Label` from shadcn/ui for auth pages |
| Auth flow type | PKCE (default) | Supabase Auth defaults to PKCE for email confirmations; do not disable it; required for the callback route `exchangeCodeForSession` call |
| Custom SMTP | Not in v1 | Custom SMTP via Resend is AUTH-05 (v2 requirement); for v1, update the Supabase Auth display name in the dashboard only |

**What is NOT used:**
- NextAuth / Auth.js — adds adapter complexity when Supabase Auth handles everything needed
- OAuth / social login — out of scope for v1 per REQUIREMENTS.md
- Client-side-only auth checks — all protected data access enforces auth server-side via `createServerClient` + `getUser()`

---

## Route Structure

```
app/
  auth/
    login/
      page.tsx          # Email/password login form + Server Action
    signup/
      page.tsx          # Email/password signup form + Server Action
    callback/
      route.ts          # GET handler — exchanges PKCE code for session, redirects to /auth/confirm
    confirm/
      page.tsx          # Post-verification landing page ("Email confirmed, you can now post")
  (protected)/
    layout.tsx          # Wraps all routes that require authentication; redirects to /auth/login if no session
middleware.ts           # Project root — session refresh on every request + protected route redirects
lib/
  supabase/
    server.ts           # Already exists from Phase 1 — createClient factory (async, cookies-based)
    client.ts           # Already exists from Phase 1 — createBrowserClient for client components
```

**Notes on route placement:**
- `app/auth/callback/route.ts` is a Route Handler (not a page) — it handles the `?code=...` query param from Supabase's email confirmation link
- `app/auth/confirm/page.tsx` is the post-verification landing page that users land on after clicking the email link and the callback route completes its exchange
- The `(protected)` route group layout is a placeholder for Phase 2 — actual protected routes (`/forum/new`, `/profile`) are built in later phases; the layout is set up now so middleware redirect logic is already wired
- `middleware.ts` lives at the **project root** (same level as `package.json`), not inside `app/`

---

## Supabase Auth Setup

### 1. Enable Email Auth in Supabase Dashboard

Navigation: **Authentication → Providers → Email**

Settings to confirm:
- **Enable Email provider**: ON (default)
- **Confirm email**: ON — this is what triggers the verification email and gates unverified users
- **Secure email change**: ON (default, keep enabled)
- **Double confirm email changes**: ON (default, keep enabled)

### 2. Configure Site URL and Redirect URLs

Navigation: **Authentication → URL Configuration**

- **Site URL**: `https://clinicaltocode.com` (use `http://localhost:3000` for local dev — Supabase uses this as the base for email confirmation links)
- **Redirect URLs** (add both):
  - `http://localhost:3000/auth/callback`
  - `https://clinicaltocode.com/auth/callback`

The `redirectTo` parameter in `signUp()` must match one of these allowed redirect URLs or Supabase will reject it. The callback route URL must use the exact path `auth/callback` as configured here.

### 3. Auth Email Templates — Branding Update

Navigation: **Authentication → Email Templates → Confirm signup**

Update the **"From" name** (sender display name) field:
- Change from: `Supabase` (or the default project name)
- Change to: `Clinical to Code`

Update the email **Subject**:
- Change to: `Confirm your Clinical to Code account`

Update the email **Body** — replace the default template with branded content:

```html
<h2>Welcome to Clinical to Code</h2>
<p>Thank you for signing up. Please confirm your email address to activate your account and participate in the forum.</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email address</a></p>
<p>If you did not sign up for Clinical to Code, you can safely ignore this email.</p>
<p>— The Clinical to Code Team</p>
```

**Important:** The `{{ .ConfirmationURL }}` template variable is required — it generates the PKCE confirmation link with the `?code=...` query parameter that the callback route consumes.

Also update **Authentication → Email Templates → Magic Link** and **Reset password** with matching branding (even though password reset is v2, the reset template should be branded before any emails are sent).

### 4. Create the `user_profiles` Trigger

When a new user signs up, Supabase creates a row in `auth.users` but nothing in `public.user_profiles` (the public-facing profile table defined in the architecture doc). A Postgres trigger handles this automatically.

Create via migration (`supabase migration new add_user_profiles`):

```sql
-- Create user_profiles table
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  credential_badge TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false NOT NULL,
  is_banned BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Public read access (profiles are public)
CREATE POLICY "profiles are publicly readable" ON public.user_profiles
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile row when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

Apply locally: `supabase db reset`
Apply to production: `supabase db push --db-url "$DIRECT_URL"`

---

## Middleware Pattern (exact code)

`middleware.ts` at the project root runs on every request. Its two jobs: (1) refresh the Supabase session token to keep users logged in across browser refreshes, and (2) redirect unauthenticated users away from protected routes.

```ts
// middleware.ts  (project root, same level as package.json)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not add any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  //
  // getUser() validates the token with the Supabase Auth server on every request.
  // This is what keeps the session alive — it refreshes the token when needed
  // and writes the updated cookie back via supabaseResponse.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Redirect unauthenticated users away from protected routes
  if (
    !user &&
    !pathname.startsWith('/auth') &&
    !pathname.startsWith('/api') &&
    pathname.startsWith('/profile')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login/signup pages
  if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: return supabaseResponse (not a new NextResponse.next()) to
  // preserve the Set-Cookie headers that refresh the session.
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Files with extensions (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Critical notes:**
- The `supabaseResponse` variable must be returned — not a new `NextResponse.next()`. If a new response is returned, the `Set-Cookie` headers that contain the refreshed token are lost, and the user will be silently logged out on the next request.
- The `matcher` pattern excludes static assets. Supabase middleware must NOT run on `_next/static` files — it would cause unnecessary auth network calls for every CSS, JS, and image file request.
- The protected route list (`/profile`) expands in later phases as more protected routes are added. In Phase 2, only `/profile` is protected. The forum write routes (`/forum/new`) added in Phase 4 are added to this guard then.
- `supabase.auth.getUser()` makes a network request to Supabase Auth to validate the JWT. This is intentional and required for security. `getSession()` is NOT used here — `getSession()` reads from the cookie without server validation and can return stale data.

---

## Server Actions Pattern (exact code)

Server Actions replace API routes for form submissions. They run on the server, have access to cookies, and return typed results to the calling component.

### Sign Up Action

```ts
// app/auth/signup/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be under 72 characters'),
})

export async function signUp(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // This is the URL the user lands on after clicking the confirmation link.
      // Supabase appends the PKCE code as ?code=... to this URL.
      // This URL must be listed in Supabase Auth → URL Configuration → Redirect URLs.
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    // Do not expose internal Supabase error messages directly to the user.
    // Map common errors to user-friendly messages.
    if (error.message.includes('already registered')) {
      return { error: 'An account with this email already exists. Try logging in.' }
    }
    return { error: 'Something went wrong. Please try again.' }
  }

  // Successful signup: Supabase has sent the confirmation email.
  // Redirect to a page that tells the user to check their inbox.
  redirect('/auth/signup?message=check-email')
}
```

### Sign In Action

```ts
// app/auth/login/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function signIn(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    // Use a generic message — do not distinguish "wrong email" from "wrong password"
    // (leaking which field is wrong helps enumeration attacks)
    return { error: 'Invalid email or password.' }
  }

  // Middleware will read the new session cookie on the next request.
  redirect('/')
}
```

### Sign Out Action

```ts
// app/auth/actions.ts  (or co-locate with a nav component)
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
```

**Calling a Server Action from a form:**

```tsx
// In a Client Component or Server Component form
import { signOut } from '@/app/auth/actions'

// Server Component (no 'use client' needed for form actions)
export function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit">Sign out</button>
    </form>
  )
}
```

**Calling a Server Action with useFormState (for error display):**

```tsx
// app/auth/signup/page.tsx
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { signUp } from './actions'

const initialState = { error: undefined }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Creating account...' : 'Create account'}
    </button>
  )
}

export default function SignUpPage() {
  const [state, formAction] = useFormState(signUp, initialState)

  return (
    <form action={formAction}>
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      {state?.error && <p role="alert">{state.error}</p>}
      <SubmitButton />
    </form>
  )
}
```

**Note on `useFormState`:** In React 19 (which ships with Next.js 15), `useFormState` is renamed to `useActionState` and imported from `react` (not `react-dom`). Check which React version is installed:
- React 18.x: use `useFormState` from `react-dom`
- React 19.x: use `useActionState` from `react`

---

## Callback Route Pattern (exact code)

The callback route handles the `?code=...` query parameter that Supabase appends to the email confirmation link. It exchanges the PKCE code for a session and redirects the user.

```ts
// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Optional: read a `next` param for post-auth redirects
  const next = searchParams.get('next') ?? '/auth/confirm'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Session is now set in the cookie.
      // Redirect to the confirmation page.
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If there is no code or an error occurred, redirect to an error page.
  return NextResponse.redirect(`${origin}/auth/login?message=confirmation-error`)
}
```

**What this route does:**
1. Reads the `?code=...` PKCE authorization code from the URL query string
2. Calls `supabase.auth.exchangeCodeForSession(code)` — this makes a server-side request to Supabase Auth to exchange the one-time code for a session token
3. Supabase writes the session token into the response cookies via the `setAll` handler
4. Redirects the user to `/auth/confirm` (the post-verification landing page)

**Why this is a Route Handler and not a page:**
Route Handlers can set cookies directly in the response. A regular `page.tsx` cannot set cookies server-side — the session must be established before the user sees any page content.

**The `emailRedirectTo` parameter in `signUp()` must point to this exact route** (`/auth/callback`). If it points anywhere else, the PKCE code exchange will not happen and the session will never be created.

---

## Email Verification Gate

### The Core Check: `email_confirmed_at`

Supabase sets `auth.users.email_confirmed_at` to a timestamp when the user clicks the confirmation link. It is `NULL` for unverified users.

**How to read it in a Server Component:**

```ts
// In any server component or server action:
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

const isVerified = user?.email_confirmed_at != null
```

**Important:** `supabase.auth.getUser()` returns the full `User` object which includes `email_confirmed_at`. Do not use `getSession()` for security-critical checks — it reads from the cookie without re-validating.

### Blocking Unverified Users in Server Components

```tsx
// Example: used in Phase 4 forum write routes
// app/forum/new/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function NewThreadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (!user.email_confirmed_at) {
    // Show inline message rather than a hard redirect — the user IS logged in,
    // they just haven't verified their email yet.
    return (
      <div role="alert">
        <h2>Verify your email to post</h2>
        <p>
          We sent a confirmation link to <strong>{user.email}</strong>.
          Please check your inbox and click the link to start participating.
        </p>
        {/* Optional: resend button — see resend verification section below */}
      </div>
    )
  }

  // Render the new thread form...
}
```

### RLS Policy — Database-Level Enforcement

In addition to the UI check, enforce verification at the database level so the check cannot be bypassed via direct API calls:

```sql
-- Migration: add to the forum_threads table policy (Phase 4)
-- For Phase 2, create this as a standalone migration to establish the pattern
-- even before forum_threads exists — it will be referenced when that table is created.

-- Pattern (apply to forum_threads and forum_replies in Phase 4):
CREATE POLICY "verified users can create threads" ON public.forum_threads
  FOR INSERT WITH CHECK (
    auth.uid() = author_id
    AND (
      SELECT email_confirmed_at
      FROM auth.users
      WHERE id = auth.uid()
    ) IS NOT NULL
  );
```

**Note:** This RLS policy references `auth.users` directly. This is allowed in Supabase policies using the `auth` schema. The `SECURITY DEFINER` context of RLS policies means `auth.uid()` and `auth.users` are always accessible.

### Resend Verification Email

For users who need to resend the confirmation email (e.g., it expired or was lost):

```ts
// Server Action
'use server'
import { createClient } from '@/lib/supabase/server'

export async function resendVerificationEmail() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) return { error: 'Not logged in' }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: user.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) return { error: 'Failed to resend. Please try again.' }
  return { success: true }
}
```

---

## Auth Email Branding

### v1 Approach: Dashboard-only branding (no custom SMTP)

Custom SMTP via Resend is AUTH-05, a v2 requirement. For v1, update the display name and template content in the Supabase dashboard. This is sufficient to prevent auth emails from saying "Supabase."

**Navigation path:** Supabase Dashboard → Authentication → Email Templates

**Templates to update:**

| Template | Subject | Key change |
|----------|---------|------------|
| Confirm signup | `Confirm your Clinical to Code account` | Sender name, branded body |
| Magic Link | `Your Clinical to Code login link` | Sender name, branded body |
| Change Email Address | `Confirm your new email — Clinical to Code` | Sender name, branded body |
| Reset Password | `Reset your Clinical to Code password` | Sender name, branded body (v2 feature, still update template now) |

**Sender name configuration:**

Navigation: Authentication → Email Templates → scroll to the top of any template → find the **"Sender name"** field (may also be labeled "From name").

- Change to: `Clinical to Code`

Note: the sender *email address* on the free Supabase tier is a shared `noreply@mail.supabase.io` address — the display name is what users see. Changing to a custom `@clinicaltocode.com` sending address requires custom SMTP (Resend), which is deferred to v2.

**Supabase's default email rate limits:** The built-in Supabase email service is rate-limited to 4 emails/hour on the free tier. For any real user load, custom SMTP must be configured before launch. This is acceptable for v1 development/testing but flag this as a pre-launch blocker: configure Resend SMTP (AUTH-05) before any public announcement.

### v1 Template Body — Confirm Signup

```html
<h2>Welcome to Clinical to Code</h2>
<p>
  You're almost there. Click the button below to confirm your email address
  and activate your account.
</p>
<p style="text-align: center; margin: 32px 0;">
  <a href="{{ .ConfirmationURL }}"
     style="background: #0066cc; color: white; padding: 12px 24px;
            border-radius: 6px; text-decoration: none; font-weight: 600;">
    Confirm email address
  </a>
</p>
<p style="color: #666; font-size: 14px;">
  If you did not sign up for Clinical to Code, you can safely ignore this email.
  This link expires in 24 hours.
</p>
```

**Required template variables (do not remove):**
- `{{ .ConfirmationURL }}` — the full PKCE confirmation URL; this is what the callback route receives

---

## Pitfalls

The following pitfalls from PITFALLS.md are directly relevant to Phase 2. Each has a specific prevention action.

### P1 — `cookies()` is async in Next.js 15

`cookies()` from `next/headers` returns a Promise in Next.js 15. Every place that calls `cookies()` must `await` it.

**Wrong:**
```ts
const cookieStore = cookies()  // returns Promise, not the store
```

**Correct:**
```ts
const cookieStore = await cookies()
```

This applies in `lib/supabase/server.ts` (already accounted for in the Phase 1 factory pattern), in the callback route, and in any custom cookie access.

### P2 — Never call `createClient()` at module level

From PITFALLS.md Pitfall 2: a module-level Supabase client is shared across requests in the same warm function, leaking auth context between users.

**Wrong:**
```ts
// At top of a file, outside any function:
const supabase = createClient() // NEVER DO THIS
```

**Correct:**
```ts
// Inside a server component, server action, or route handler:
export default async function Page() {
  const supabase = await createClient()
  // ...
}
```

### P3 — Never use `getSession()` for security checks

`getSession()` reads the JWT from the cookie without validating it against the Supabase Auth server. A compromised or stale session is not caught.

**Wrong for auth gating:**
```ts
const { data: { session } } = await supabase.auth.getSession()
if (!session) redirect('/auth/login') // INSECURE
```

**Correct:**
```ts
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/auth/login') // validates with server
```

### P4 — PKCE flow must not be disabled

Supabase Auth defaults to PKCE for email confirmations. The `exchangeCodeForSession(code)` call in the callback route only works with PKCE. Do not pass `flowType: 'implicit'` to the Supabase client configuration.

### P5 — Middleware must return `supabaseResponse`, not a new `NextResponse.next()`

If the middleware returns `NextResponse.next()` without the cookie updates from `supabaseResponse`, the refreshed session token is lost and users are randomly logged out.

**Wrong:**
```ts
await supabase.auth.getUser()
return NextResponse.next() // loses cookie updates
```

**Correct:**
```ts
// See the full middleware pattern in the Middleware section above.
// Always return supabaseResponse.
return supabaseResponse
```

### P6 — Middleware matcher must exclude static files

Without the exclusion pattern, the middleware runs on every CSS, JS, and image request — causing unnecessary Supabase Auth network calls on static assets and slowing down the page.

The matcher in the middleware code above already handles this:
```ts
'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
```

### P7 — `emailRedirectTo` must match an allowed redirect URL

If the URL passed to `emailRedirectTo` in `signUp()` is not listed in Supabase Auth → URL Configuration → Redirect URLs, Supabase silently uses the Site URL instead — the `?code=` parameter never reaches the callback route, and the session exchange fails.

**Resolution:** Add both `http://localhost:3000/auth/callback` and `https://clinicaltocode.com/auth/callback` to Redirect URLs in the dashboard before testing.

### P8 — Supabase free tier email rate limit

4 emails/hour on the free Supabase email service. If testing with multiple signups rapidly, you will hit this limit and verification emails will not be delivered. Use a single test email for local development. Custom SMTP (Resend) removes this limit — deferred to v2 (AUTH-05).

### P9 — `NEXT_PUBLIC_SITE_URL` must be set

The `emailRedirectTo` parameter constructs the URL using `process.env.NEXT_PUBLIC_SITE_URL`. If this variable is not set, the URL will be `undefined/auth/callback` — an invalid URL.

Add to `.env.local`:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Add to Vercel environment variables (Production):
```
NEXT_PUBLIC_SITE_URL=https://clinicaltocode.com
```

---

## Validation Architecture

### How to verify each Phase 2 success criterion

**Criterion 1: New user → signup → verification email → click link → confirmation page**

1. Start local dev server (`npm run dev`)
2. Navigate to `http://localhost:3000/auth/signup`
3. Submit the form with a real email address (use a service like Mailinator or your own email for local testing)
4. Verify redirect to `/auth/signup?message=check-email` with "check your inbox" message
5. Open the email — sender display name should read "Clinical to Code", subject should read "Confirm your Clinical to Code account"
6. Click the confirmation link — URL should match `http://localhost:3000/auth/callback?code=...`
7. Verify redirect to `/auth/confirm` with a confirmation success message
8. Open Supabase Studio (local: `http://127.0.0.1:54323`) → Authentication → Users — verify `email_confirmed_at` is now populated for the test user

**Criterion 2: Unverified user attempting to post is blocked**

1. Sign up with a new email but do NOT click the confirmation link
2. Navigate to a protected write route (in Phase 2 this is simulated; actual forum routes are in Phase 4)
3. Verify the "verify your email" message appears and the form is not rendered
4. Query the DB directly: `SELECT email_confirmed_at FROM auth.users WHERE email = 'test@example.com'` — value should be NULL

**Criterion 3: Logged-in user remains authenticated after browser refresh**

1. Sign in with a verified account
2. Open DevTools → Application → Cookies — note the `sb-[ref]-auth-token` cookie(s)
3. Hard-refresh the page (Cmd+Shift+R / Ctrl+Shift+R)
4. Verify the user is still logged in (e.g., a nav component shows the user's email or a sign-out button)
5. Close and reopen the browser tab — verify still logged in
6. Wait 1 hour with the tab open — verify the session was silently refreshed by middleware (no logout prompt)

**Criterion 4: Sign out → session invalidated → protected routes redirect to login**

1. While logged in, call the signOut Server Action (click sign-out button)
2. Verify redirect to `/auth/login`
3. Attempt to navigate to `/profile` (or another protected route)
4. Verify redirect back to `/auth/login`
5. Check DevTools → Application → Cookies — `sb-[ref]-auth-token` cookies should be cleared

**Criterion 5: Auth emails show clinicaltocode.com sender name**

1. Navigate to Supabase Dashboard → Authentication → Email Templates → Confirm signup
2. Verify "Sender name" field reads "Clinical to Code"
3. Complete a test signup with a real email — verify the received email shows "Clinical to Code" as the sender name in the email client (Gmail, Apple Mail, etc.)
4. Verify the email body does not contain the word "Supabase"

---

## Step-by-Step Implementation Sequence

The order matters. Each step unblocks the next.

### Step 1 — Add `NEXT_PUBLIC_SITE_URL` environment variable

- Add `NEXT_PUBLIC_SITE_URL=http://localhost:3000` to `.env.local`
- Add `NEXT_PUBLIC_SITE_URL=https://clinicaltocode.com` to Vercel production environment variables
- This is used in `emailRedirectTo` and must exist before any auth action is written

### Step 2 — Create the `user_profiles` migration

- Run: `supabase migration new add_user_profiles`
- Write the SQL from the "Supabase Auth Setup" section above (table, RLS policies, trigger function)
- Apply locally: `supabase db reset`
- Verify in local Supabase Studio that the table exists and the trigger is active

### Step 3 — Configure Supabase Auth dashboard settings

- Authentication → Providers → Email — confirm "Confirm email" is ON
- Authentication → URL Configuration — set Site URL to `http://localhost:3000` for dev; add both redirect URLs
- Authentication → Email Templates — update "Confirm signup" sender name and body

### Step 4 — Write `middleware.ts`

- Create `middleware.ts` at the project root using the exact pattern from the Middleware section above
- Verify locally: `npm run dev` → navigate to any page → check Vercel/terminal logs show no middleware errors
- Test redirect: visit `/profile` while logged out → should redirect to `/auth/login`

### Step 5 — Build the signup page and Server Action

- Create `app/auth/signup/actions.ts` with the `signUp` Server Action
- Create `app/auth/signup/page.tsx` with the form component using `useFormState` / `useActionState`
- Test: submit the form with an invalid email → verify error message appears inline
- Test: submit the form with a valid email → verify redirect to `?message=check-email`

### Step 6 — Build the callback route

- Create `app/auth/callback/route.ts` using the exact pattern from the Callback Route section above
- Test: complete a real signup flow → click the email link → verify it hits this route and redirects to `/auth/confirm`
- Verify in Supabase local dashboard: the user's `email_confirmed_at` is now set

### Step 7 — Build the confirmation page

- Create `app/auth/confirm/page.tsx` — a simple page with "Email confirmed! You can now participate in the forum." message
- Include a link to the forum (or homepage if forum doesn't exist yet) and a link to the user's profile

### Step 8 — Build the login page and Server Action

- Create `app/auth/login/actions.ts` with the `signIn` Server Action
- Create `app/auth/login/page.tsx` with the login form
- Test: submit with wrong credentials → verify generic error message (no field-level specificity)
- Test: submit with correct credentials → verify redirect to `/`

### Step 9 — Build the sign-out action and wire it to navigation

- Create the `signOut` Server Action in `app/auth/actions.ts`
- Add a sign-out button to the site navigation (header component)
- Test: sign in → click sign out → verify redirect to `/auth/login` and session cleared from cookies

### Step 10 — Test the email verification gate (pre-Phase 4 simulation)

- Create a test unverified user by signing up and not clicking the confirmation link
- Manually add a conditional block to a test page that checks `user.email_confirmed_at`
- Verify the "verify your email" message renders for unverified users
- Remove the test code — the actual gate is implemented in Phase 4 when forum routes are built

### Step 11 — Apply migration to production and update Vercel env vars

- `supabase db push --db-url "$DIRECT_URL"` to apply the `user_profiles` migration to production
- In Vercel: add `NEXT_PUBLIC_SITE_URL=https://clinicaltocode.com`
- Update Supabase Auth → URL Configuration on production: Site URL + redirect URLs to `https://clinicaltocode.com/auth/callback`
- Deploy and run through all 5 success criteria against the production URL

### Step 12 — Final verification

Run through all 5 success criteria end-to-end (see Validation Architecture section above) against both local dev and the production/preview Vercel URL.

---

*Phase: 02-auth*
*Research authored: 2026-03-15*
