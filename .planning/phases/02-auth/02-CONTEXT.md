# Phase 2: Auth - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement all authentication flows for email/password signup, email verification, and persistent login sessions. Phase 2 produces working auth UI pages, a middleware-enforced session layer, and a verified-user gate that blocks unverified users from protected routes. No forum or profile features are built in this phase — this phase only creates the auth infrastructure those later phases depend on.

</domain>

<decisions>
## Implementation Decisions

### Form Library

Plain HTML `<form>` elements with Next.js Server Actions — no React Hook Form in Phase 2. The auth forms (signup, login) have at most three fields each; the overhead of a form library is not justified. Server Actions keep the form handling co-located with the page and eliminate the need for a client component boundary.

### Validation

Server-side only. No Zod schema in Phase 2 — Supabase Auth returns structured error messages (e.g. "Invalid login credentials", "User already registered") that are sufficient for inline error display. Zod will be introduced in later phases when form complexity warrants it.

### Redirect After Login

Successful login redirects to `/` (homepage). Simple and unambiguous — no "return to previous page" logic in Phase 2.

### Redirect After Signup

Successful signup redirects to `/auth/confirm` — a static page with a "Check your email" message explaining that a verification link has been sent. This page requires no auth state and is purely informational.

### Verified User Gate

`middleware.ts` checks `user.email_confirmed_at` on every request. If the field is `null` (unverified), requests to `/forum/*` and `/profile/*` are redirected to `/auth/verify-email` — a notice page with instructions to check email and a resend-link option. Unauthenticated users hitting protected routes are redirected to `/auth/login`.

### Protected Routes in Phase 2

Only `/forum/*` and `/profile/*` require auth + email verification. `/articles/*` is fully public. The admin routes (`/admin/*`) are not wired in this phase — that is Phase 6 scope.

### Session Storage

Supabase Auth handles sessions via HTTP-only cookies. `middleware.ts` calls `supabase.auth.getUser()` on every request to refresh the token if needed — this is the pattern prescribed by `@supabase/ssr` and is required for sessions to persist correctly in the App Router. Do not use `getSession()` server-side; `getUser()` makes a network call to validate the JWT against Supabase's server, which is the secure approach.

### Auth Email Sender Name

Update the sender name in the Supabase dashboard (Authentication → Email Templates → Sender name) to "Clinical to Code". No custom SMTP in Phase 2 — Supabase's default email delivery is sufficient for early development and testing. Custom SMTP via Resend is AUTH-05, deferred to v2.

### Auth Pages Route Structure

All auth pages live under `app/auth/`:
- `app/auth/login/page.tsx` — email/password login form
- `app/auth/signup/page.tsx` — email/password signup form
- `app/auth/confirm/page.tsx` — static "check your email" post-signup page
- `app/auth/verify-email/page.tsx` — notice page for unverified users hitting protected routes
- `app/auth/callback/route.ts` — Supabase Auth callback handler (exchanges code for session, handles email verification link clicks)

### Supabase Client Factories

Phase 1 established `lib/supabase/` as the location for client factories. Phase 2 uses:
- `lib/supabase/server.ts` — `createServerClient` from `@supabase/ssr` for Server Components and Server Actions (reads/writes cookies via the `cookies()` API)
- `lib/supabase/middleware.ts` — `createServerClient` configured for `middleware.ts` (reads/writes cookies via the middleware `request`/`response` objects)
- `lib/supabase/browser.ts` — `createBrowserClient` from `@supabase/ssr` for any Client Components that need auth state (sign-out button, etc.)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — project vision, constraints, core value
- `.planning/REQUIREMENTS.md` — AUTH-01, AUTH-02, AUTH-03 acceptance criteria
- `.planning/ROADMAP.md` — Phase 2 success criteria (5 items to verify)

### Research
- `.planning/research/STACK.md` — stack decisions, especially "Auth Architecture" section (Supabase Auth + `@supabase/ssr`, rationale for rejecting NextAuth/Clerk)
- `.planning/research/PITFALLS.md` — review for any auth-relevant pitfalls before implementing

### Phase 1 Output
- `.planning/phases/01-foundation/01-CONTEXT.md` — directory structure, lib layout, and design token decisions carried into this phase

</canonical_refs>

<code_context>
## Code Context — What Phase 1 Built

Phase 2 builds directly on the following Phase 1 outputs:

### Directory Structure (established in Phase 1)
- `app/` — Next.js App Router root; Phase 2 adds `app/auth/` subtree
- `lib/supabase/` — Supabase client factories; Phase 2 populates these files
- `components/ui/` — shadcn/ui primitives; Phase 2 will use Button, Input, Label, and Form-related components for auth forms
- `middleware.ts` — exists as a stub or basic pass-through; Phase 2 replaces it with the full session-refresh + route-guard implementation

### Environment Variables (configured in Phase 1)
- `NEXT_PUBLIC_SUPABASE_URL` — already set in `.env.local` and Vercel
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — already set in `.env.local` and Vercel

No new environment variables are required for Phase 2 auth flows. The service role key (`SUPABASE_SERVICE_ROLE_KEY`) is already set from Phase 1 but is not used in Phase 2 auth flows (the anon key + RLS is correct for user-facing auth).

### Supabase Schema
- `auth.users` table is managed by Supabase — no migration needed to enable email/password auth
- Phase 2 does NOT create a `public.profiles` table — that is Phase 5 scope. Phase 2 works entirely with `auth.users`.

### Design System
- Brand colors (`primary` blue `#0066cc`, `secondary` green `#00a86b`) are already in the Tailwind config
- System font stack is already configured
- shadcn/ui is already installed; use existing component CLI to add any missing primitives

</code_context>

<specifics>
## Specific Ideas

- The `app/auth/callback/route.ts` handler must call `supabase.auth.exchangeCodeForSession(code)` with the `code` query parameter Supabase appends to the email verification link. Without this handler, clicking the verification email link will not establish a session.
- The "resend verification email" option on `/auth/verify-email` should call `supabase.auth.resend({ type: 'signup', email })` — but this requires the user's email to be available. Store it in a query param on the redirect or prompt the user to enter it again.
- The middleware must call `supabase.auth.getUser()` (not `getSession()`) — Supabase's own documentation for App Router explicitly states that `getSession()` should not be trusted server-side because it reads from the cookie without re-validating with the Supabase server.
- Sign-out should be a Server Action (POST), not a plain link (GET) — using a GET request to sign out is a CSRF vulnerability. Use a `<form>` with a hidden submit button or a client component that calls `supabase.auth.signOut()` then `router.push('/')`.
- The middleware matcher should exclude `/_next/`, `/favicon.ico`, and static asset paths — only run auth checks on actual page routes and API routes.

</specifics>

<deferred>
## Deferred Ideas

- **Custom SMTP via Resend** (AUTH-05) — configure Supabase to send auth emails through a `@clinicaltocode.com` address via Resend SMTP. Deferred to v2 per requirements.
- **Password reset flow** (AUTH-04) — "forgot password" email link and reset form. Deferred to v2 per requirements.
- **Zod validation on auth forms** — server-side schema validation with typed error messages. Not needed in Phase 2 because Supabase error messages are sufficient; introduce in Phase 3+ when form complexity increases.
- **React Hook Form** — not needed until forms have more than 3–4 fields with interdependencies. Revisit in Phase 5 (profile settings form).
- **Rate limiting on auth endpoints** — `@upstash/ratelimit` on signup and login Server Actions to prevent brute force. Important before public launch; implement in Phase 6 alongside other hardening work, or earlier if the forum goes live first.
- **OAuth / social login** — explicitly out of scope for v1 per REQUIREMENTS.md.
- **`public.profiles` table creation** — Phase 5 will create this table with a foreign key to `auth.users`. Phase 2 auth works entirely against `auth.users` and does not need the profiles table.

</deferred>

---

*Phase: 02-auth*
*Context gathered: 2026-03-15*
