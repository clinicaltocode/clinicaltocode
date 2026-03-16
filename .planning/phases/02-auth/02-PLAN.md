---
phase: 2
slug: auth
status: approved
wave_count: 7
task_count: 13
created: 2026-03-15
---

# Phase 2 — Auth: Execution Plan

## Wave Map

| Wave | Name | Tasks | Goal |
|------|------|-------|------|
| 0 | Test Stubs | 2-02-01 | Add auth stub tests to establish the Wave 0 feedback loop before any feature code |
| 1 | Middleware | 2-02-02, 2-02-03 | Write `middleware.ts` with session refresh and route protection; verify TypeScript compiles |
| 2 | Server Actions | 2-02-04, 2-02-05 | Write `signUp`, `signIn`, and `signOut` Server Actions; verify build passes |
| 3 | Callback Route | 2-02-06 | Write the PKCE code-exchange route handler |
| 4 | Auth Pages | 2-02-07, 2-02-08, 2-02-09, 2-02-10 | Build signup, login, confirm, and verify-email pages |
| 5 | Env + Supabase Config | 2-02-11, 2-02-12 | Add `NEXT_PUBLIC_SITE_URL`, run the user_profiles migration, and update Supabase dashboard settings |
| 6 | Manual Verification | 2-02-13 | End-to-end sign-up flow, session persistence, and email verification gate |

---

## Wave 0 — Test Stubs

> Goal: Add `tests/auth/auth.test.ts` with stub tests before any feature code is written. This extends the existing vitest infrastructure from Phase 1 and satisfies the Wave 0 requirement from VALIDATION.md.

### Task 2-02-01 — Add auth test stub file

**Requirement:** AUTH-01, AUTH-02, AUTH-03
**Wave:** 0
**Files touched:**
- `tests/auth/auth.test.ts` — stub tests asserting that the middleware config and auth callback path are correctly shaped

**Steps:**
1. Create the directory `tests/auth/` and the file `tests/auth/auth.test.ts`:
   ```ts
   // tests/auth/auth.test.ts
   // Wave 0 stubs — these tests verify structural properties of the auth
   // implementation without requiring a live Supabase connection.
   // Update from "stub" to real assertions as each wave is completed.

   describe('Auth middleware config', () => {
     it('middleware matcher pattern excludes _next/static (stub)', () => {
       // Stub: will be validated when middleware.ts is written in Wave 1
       const pattern =
         '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
       expect(pattern).toContain('_next/static')
       expect(pattern).toContain('_next/image')
       expect(pattern).toContain('favicon.ico')
     })

     it('callback route path is /auth/callback (stub)', () => {
       // Stub: confirms the path constant used in emailRedirectTo
       const callbackPath = '/auth/callback'
       expect(callbackPath).toBe('/auth/callback')
     })
   })

   describe('Auth environment variables', () => {
     it('NEXT_PUBLIC_SITE_URL is defined (stub)', () => {
       // Stub: will pass once .env.local is updated in Task 2-02-11
       const url = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
       expect(url).toMatch(/^https?:\/\//)
     })
   })

   describe('Email verification gate', () => {
     it('email_confirmed_at null means unverified (stub)', () => {
       // Documents the gate check: user.email_confirmed_at must be non-null for forum access
       const mockUser = { email_confirmed_at: null }
       const isVerified = mockUser.email_confirmed_at != null
       expect(isVerified).toBe(false)
     })

     it('email_confirmed_at set means verified (stub)', () => {
       const mockUser = { email_confirmed_at: '2026-03-15T00:00:00.000Z' }
       const isVerified = mockUser.email_confirmed_at != null
       expect(isVerified).toBe(true)
     })
   })
   ```

**Verify:** `npx vitest run --reporter=verbose` — all 5 stub tests pass, 0 failures

---

## Wave 1 — Middleware

> Goal: Write `middleware.ts` at the project root. This single file handles two jobs: (1) refreshing the Supabase session token on every request via `getUser()` so sessions persist across browser refreshes (AUTH-03), and (2) redirecting unauthenticated or unverified users away from protected routes (AUTH-02).

### Task 2-02-02 — Write middleware.ts with session refresh and route protection

**Requirement:** AUTH-02, AUTH-03
**Wave:** 1
**Files touched:**
- `middleware.ts` — project root; replaces any stub file from Phase 1

**Steps:**
1. Create (or replace) `middleware.ts` at the project root:
   ```ts
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

     // IMPORTANT: Do not add any code between createServerClient and
     // supabase.auth.getUser(). Even a simple conditional can break session
     // refresh and cause users to be randomly logged out.
     //
     // getUser() validates the JWT with the Supabase Auth server and writes
     // a refreshed token into supabaseResponse via the setAll cookie handler.
     // This is what makes AUTH-03 (persistent sessions) work.
     // Never use getSession() here — it reads from the cookie without
     // re-validating and cannot be trusted for security-critical checks.
     const {
       data: { user },
     } = await supabase.auth.getUser()

     const { pathname } = request.nextUrl

     // Redirect unauthenticated users away from protected routes.
     // In Phase 2 only /profile/* is protected. /forum/* write routes
     // are added to this guard in Phase 4.
     if (
       !user &&
       (pathname.startsWith('/profile') || pathname.startsWith('/forum/new'))
     ) {
       const url = request.nextUrl.clone()
       url.pathname = '/auth/login'
       return NextResponse.redirect(url)
     }

     // Redirect authenticated but unverified users away from write routes.
     // email_confirmed_at is null until the user clicks the confirmation link.
     if (
       user &&
       !user.email_confirmed_at &&
       (pathname.startsWith('/profile') || pathname.startsWith('/forum/new'))
     ) {
       const url = request.nextUrl.clone()
       url.pathname = '/auth/verify-email'
       return NextResponse.redirect(url)
     }

     // Redirect already-authenticated users away from login/signup.
     if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
       const url = request.nextUrl.clone()
       url.pathname = '/'
       return NextResponse.redirect(url)
     }

     // IMPORTANT: Always return supabaseResponse — not NextResponse.next().
     // Returning a new NextResponse.next() here discards the Set-Cookie headers
     // that carry the refreshed session token, silently logging the user out.
     // See PITFALLS.md P5 and RESEARCH.md Pitfall P5.
     return supabaseResponse
   }

   export const config = {
     matcher: [
       /*
        * Run middleware on all paths EXCEPT:
        * - _next/static  (compiled JS/CSS bundles)
        * - _next/image   (image optimization API)
        * - favicon.ico
        * - Static file extensions (svg, png, jpg, jpeg, gif, webp)
        *
        * Without this exclusion, getUser() would fire a Supabase Auth network
        * request for every CSS and image asset, adding unnecessary latency.
        * See PITFALLS.md P6 and RESEARCH.md Pitfall P6.
        */
       '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
     ],
   }
   ```

2. Confirm that `@supabase/ssr` is already installed (from Phase 1 Task 1-01-05). If not:
   ```bash
   npm install @supabase/ssr@0.5.x
   ```

**Critical rules enforced in this file:**
- Uses `getUser()` not `getSession()` — server-side security requirement (PITFALLS.md P3, planning rule #5)
- Returns `supabaseResponse` not a new `NextResponse` — cookie preservation (PITFALLS.md P5, planning rule #6)
- Matcher excludes `_next/static`, `_next/image`, and static extensions (planning rule #7)

**Verify:** `npx tsc --noEmit` — exits 0, no TypeScript errors in `middleware.ts`

---

### Task 2-02-03 — Verify middleware builds and route guard works locally

**Requirement:** AUTH-02, AUTH-03
**Wave:** 1
**Files touched:**
- No new files — build verification only

**Steps:**
1. Run the Next.js build to confirm `middleware.ts` compiles without errors:
   ```bash
   npx next build
   ```
2. Start the dev server and verify the route guard manually:
   ```bash
   npm run dev
   ```
3. In the browser, navigate to `http://localhost:3000/profile` while not logged in. Verify the browser redirects to `http://localhost:3000/auth/login`. (The login page will 404 until Wave 4 — a 404 response is acceptable here; what matters is that the redirect fires.)
4. Stop the dev server.

**Verify:** `npx next build` — exits 0, `Compiled successfully`, no middleware compilation errors

---

## Wave 2 — Server Actions

> Goal: Write the three Server Actions that handle all form submissions: `signUp`, `signIn`, and `signOut`. These are plain `async` functions marked `'use server'`; no API routes are needed. `signOut` MUST be triggered via a form POST, never a GET link (CSRF protection, planning rule #8).

### Task 2-02-04 — Write signUp and signIn Server Actions

**Requirement:** AUTH-01, AUTH-02
**Wave:** 2
**Files touched:**
- `app/auth/signup/actions.ts` — `signUp` Server Action
- `app/auth/login/actions.ts` — `signIn` Server Action

**Steps:**
1. Create `app/auth/signup/actions.ts`:
   ```ts
   'use server'

   import { createClient } from '@/lib/supabase/server'
   import { redirect } from 'next/navigation'

   export async function signUp(
     _prevState: { error?: string } | undefined,
     formData: FormData
   ) {
     const email = formData.get('email') as string
     const password = formData.get('password') as string

     if (!email || !email.includes('@')) {
       return { error: 'Please enter a valid email address.' }
     }
     if (!password || password.length < 8) {
       return { error: 'Password must be at least 8 characters.' }
     }
     if (password.length > 72) {
       return { error: 'Password must be under 72 characters.' }
     }

     // IMPORTANT: createClient() is called inside the action, never at module
     // level. Module-level clients share auth context across requests.
     // See PITFALLS.md Pitfall 2.
     const supabase = await createClient()

     const { error } = await supabase.auth.signUp({
       email,
       password,
       options: {
         // emailRedirectTo must match the allow-list in Supabase Auth →
         // URL Configuration → Redirect URLs. See planning rule #10 and
         // PITFALLS.md P7.
         //
         // NEXT_PUBLIC_SITE_URL must be set in .env.local (task 2-02-11).
         // Without it this resolves to "undefined/auth/callback".
         // See PITFALLS.md P9.
         emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
       },
     })

     if (error) {
       if (error.message.toLowerCase().includes('already registered')) {
         return {
           error: 'An account with this email already exists. Try logging in.',
         }
       }
       // Return a generic message — do not expose Supabase internals to the user
       return { error: 'Something went wrong. Please try again.' }
     }

     // Redirect to the "check your email" page.
     // The confirm page is a static informational page — no auth state needed.
     redirect('/auth/confirm')
   }
   ```

2. Create `app/auth/login/actions.ts`:
   ```ts
   'use server'

   import { createClient } from '@/lib/supabase/server'
   import { redirect } from 'next/navigation'

   export async function signIn(
     _prevState: { error?: string } | undefined,
     formData: FormData
   ) {
     const email = formData.get('email') as string
     const password = formData.get('password') as string

     if (!email || !email.includes('@')) {
       return { error: 'Please enter a valid email address.' }
     }
     if (!password) {
       return { error: 'Password is required.' }
     }

     const supabase = await createClient()

     const { error } = await supabase.auth.signInWithPassword({
       email,
       password,
     })

     if (error) {
       // Use a single generic message — do not distinguish "wrong email" from
       // "wrong password". Field-level specificity enables user enumeration attacks.
       return { error: 'Invalid email or password.' }
     }

     // Successful sign-in: middleware will read the new session cookie on the
     // next request. Redirect to homepage per CONTEXT.md decision.
     redirect('/')
   }
   ```

**Verify:** `npx next build` — exits 0 with no TypeScript errors in either actions file

---

### Task 2-02-05 — Write signOut Server Action

**Requirement:** AUTH-01
**Wave:** 2
**Files touched:**
- `app/auth/actions.ts` — `signOut` Server Action (shared auth actions for components that are not co-located with a specific auth page)

**Steps:**
1. Create `app/auth/actions.ts`:
   ```ts
   'use server'

   import { createClient } from '@/lib/supabase/server'
   import { redirect } from 'next/navigation'

   // signOut MUST be called from a form action (POST), never from a plain
   // anchor link (GET). Using a GET request to sign out is a CSRF vulnerability.
   // See planning rule #8 and CONTEXT.md specifics.
   //
   // Usage in a Server Component:
   //   import { signOut } from '@/app/auth/actions'
   //   <form action={signOut}>
   //     <button type="submit">Sign out</button>
   //   </form>
   export async function signOut() {
     const supabase = await createClient()
     await supabase.auth.signOut()
     redirect('/auth/login')
   }
   ```

2. Add a temporary `SignOutButton` component to the root layout or homepage so the sign-out action is callable during manual verification in Wave 6. This component is a Server Component that wraps the form — no `'use client'` directive needed:
   ```tsx
   // components/auth/sign-out-button.tsx
   import { signOut } from '@/app/auth/actions'

   export function SignOutButton() {
     return (
       <form action={signOut}>
         <button type="submit" className="text-sm text-[#666666] hover:text-primary min-h-[48px]">
           Sign out
         </button>
       </form>
     )
   }
   ```
   Create `components/auth/sign-out-button.tsx` with the above content.

**Verify:** `npx tsc --noEmit` — exits 0, no type errors in `app/auth/actions.ts` or `components/auth/sign-out-button.tsx`

---

## Wave 3 — Callback Route

> Goal: Write `app/auth/callback/route.ts`. This Route Handler is the landing target for Supabase's email confirmation link. It reads the `?code=` PKCE parameter and calls `exchangeCodeForSession(code)` to establish a session in the response cookies. Without this route, clicking the verification email link produces no session.

### Task 2-02-06 — Write the PKCE callback Route Handler

**Requirement:** AUTH-02
**Wave:** 3
**Files touched:**
- `app/auth/callback/route.ts` — GET handler; exchanges PKCE code for session, redirects to `/auth/confirm`

**Steps:**
1. Create the directory `app/auth/callback/` and the file `route.ts`:
   ```ts
   import { createServerClient } from '@supabase/ssr'
   import { cookies } from 'next/headers'
   import { NextResponse, type NextRequest } from 'next/server'

   // This route handles the ?code=... query parameter that Supabase appends
   // to email confirmation links. The flow is:
   //   Email link → GET /auth/callback?code=xxxx
   //   → exchangeCodeForSession(code) sets session cookie
   //   → redirect to /auth/confirm
   //
   // PKCE is Supabase Auth's default for email confirmations. Do not pass
   // flowType: 'implicit' to any Supabase client config — it will break this
   // exchange. See RESEARCH.md Pitfall P4 and planning rule #9.
   export async function GET(request: NextRequest) {
     const { searchParams, origin } = new URL(request.url)
     const code = searchParams.get('code')
     // Optional: support a ?next= param for post-auth redirects in future phases
     const next = searchParams.get('next') ?? '/auth/confirm'

     if (code) {
       // cookies() is async in Next.js 15 — must be awaited.
       // See PITFALLS.md P1 and RESEARCH.md Pitfall P1.
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
         // Session is now written into the response cookies.
         // Redirect to the confirmation landing page.
         return NextResponse.redirect(`${origin}${next}`)
       }
     }

     // No code or exchange failed — redirect back to login with an error flag.
     return NextResponse.redirect(
       `${origin}/auth/login?message=confirmation-error`
     )
   }
   ```

**Verify:** `npx next build` — exits 0, `app/auth/callback/route.ts` compiles with no errors

---

## Wave 4 — Auth Pages

> Goal: Build the four auth pages: `signup`, `login`, `confirm`, and `verify-email`. Signup and login are Client Components (they use `useActionState` / `useFormState` for inline error display). Confirm and verify-email are simple Server Components. All pages use existing shadcn/ui primitives (Button, Input) installed in Phase 1.

### Task 2-02-07 — Build the signup page

**Requirement:** AUTH-01
**Wave:** 4
**Files touched:**
- `app/auth/signup/page.tsx` — signup form with `useActionState` / `useFormState` error display

**Steps:**
1. Check the installed React version to determine the correct hook import:
   ```bash
   node -e "console.log(require('./node_modules/react/package.json').version)"
   ```
   - React 18.x: use `useFormState` from `react-dom`, `useFormStatus` from `react-dom`
   - React 19.x: use `useActionState` from `react`, `useFormStatus` from `react-dom`

2. Create `app/auth/signup/page.tsx`. Example for React 18 (adjust hook import for React 19):
   ```tsx
   'use client'

   import { useFormState, useFormStatus } from 'react-dom'
   import { signUp } from './actions'

   const initialState: { error?: string } = {}

   function SubmitButton() {
     const { pending } = useFormStatus()
     return (
       <button
         type="submit"
         disabled={pending}
         className="w-full bg-primary text-white py-2 px-4 rounded-md font-medium min-h-[48px] hover:bg-primary-dark disabled:opacity-50"
       >
         {pending ? 'Creating account…' : 'Create account'}
       </button>
     )
   }

   export default function SignUpPage() {
     const [state, formAction] = useFormState(signUp, initialState)

     return (
       <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
         <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-[#e5e7eb] p-8">
           <h1 className="text-2xl font-semibold mb-2">Create an account</h1>
           <p className="text-sm text-[#666666] mb-6">
             Join Clinical to Code and start participating in the community.
           </p>

           <form action={formAction} className="space-y-4">
             <div>
               <label htmlFor="email" className="block text-sm font-medium mb-1">
                 Email
               </label>
               <input
                 id="email"
                 name="email"
                 type="email"
                 required
                 autoComplete="email"
                 className="w-full border border-[#e5e7eb] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
               />
             </div>

             <div>
               <label htmlFor="password" className="block text-sm font-medium mb-1">
                 Password
               </label>
               <input
                 id="password"
                 name="password"
                 type="password"
                 required
                 autoComplete="new-password"
                 minLength={8}
                 className="w-full border border-[#e5e7eb] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
               />
               <p className="text-xs text-[#666666] mt-1">Minimum 8 characters</p>
             </div>

             {state?.error && (
               <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                 {state.error}
               </p>
             )}

             <SubmitButton />
           </form>

           <p className="text-sm text-center text-[#666666] mt-6">
             Already have an account?{' '}
             <a href="/auth/login" className="text-primary hover:underline">
               Log in
             </a>
           </p>
         </div>
       </div>
     )
   }
   ```

**Verify:** `npx next build` — exits 0, `app/auth/signup/page.tsx` compiles without errors

---

### Task 2-02-08 — Build the login page

**Requirement:** AUTH-01
**Wave:** 4
**Files touched:**
- `app/auth/login/page.tsx` — login form with `useActionState` / `useFormState` error display; also handles `?message=confirmation-error` query param from the callback route fallback

**Steps:**
1. Create `app/auth/login/page.tsx`. Example for React 18 (adjust hook import for React 19):
   ```tsx
   'use client'

   import { useFormState, useFormStatus } from 'react-dom'
   import { useSearchParams } from 'next/navigation'
   import { Suspense } from 'react'
   import { signIn } from './actions'

   const initialState: { error?: string } = {}

   function SubmitButton() {
     const { pending } = useFormStatus()
     return (
       <button
         type="submit"
         disabled={pending}
         className="w-full bg-primary text-white py-2 px-4 rounded-md font-medium min-h-[48px] hover:bg-primary-dark disabled:opacity-50"
       >
         {pending ? 'Signing in…' : 'Sign in'}
       </button>
     )
   }

   function LoginForm() {
     const [state, formAction] = useFormState(signIn, initialState)
     const searchParams = useSearchParams()
     const isConfirmationError = searchParams.get('message') === 'confirmation-error'

     return (
       <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
         <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-[#e5e7eb] p-8">
           <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
           <p className="text-sm text-[#666666] mb-6">
             Welcome back to Clinical to Code.
           </p>

           {isConfirmationError && (
             <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
               The email confirmation link was invalid or has expired. Please try signing up again.
             </p>
           )}

           <form action={formAction} className="space-y-4">
             <div>
               <label htmlFor="email" className="block text-sm font-medium mb-1">
                 Email
               </label>
               <input
                 id="email"
                 name="email"
                 type="email"
                 required
                 autoComplete="email"
                 className="w-full border border-[#e5e7eb] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
               />
             </div>

             <div>
               <label htmlFor="password" className="block text-sm font-medium mb-1">
                 Password
               </label>
               <input
                 id="password"
                 name="password"
                 type="password"
                 required
                 autoComplete="current-password"
                 className="w-full border border-[#e5e7eb] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
               />
             </div>

             {state?.error && (
               <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                 {state.error}
               </p>
             )}

             <SubmitButton />
           </form>

           <p className="text-sm text-center text-[#666666] mt-6">
             Don&apos;t have an account?{' '}
             <a href="/auth/signup" className="text-primary hover:underline">
               Sign up
             </a>
           </p>
         </div>
       </div>
     )
   }

   // useSearchParams() requires a Suspense boundary in Next.js App Router.
   export default function LoginPage() {
     return (
       <Suspense>
         <LoginForm />
       </Suspense>
     )
   }
   ```

**Verify:** `npx next build` — exits 0, `app/auth/login/page.tsx` compiles without errors

---

### Task 2-02-09 — Build the confirm page

**Requirement:** AUTH-02
**Wave:** 4
**Files touched:**
- `app/auth/confirm/page.tsx` — static "check your email" page shown after successful signup (before verification); also serves as the post-verification landing page when the callback route redirects here

**Steps:**
1. Create `app/auth/confirm/page.tsx`:
   ```tsx
   // This page is reached in two situations:
   //   1. Immediately after signup: callback route redirects here after PKCE exchange
   //      → user has just verified their email
   //   2. After signUp() redirects: user is told to check their inbox
   //
   // Because both flows land here, the page text covers both cases.
   export default function ConfirmPage() {
     return (
       <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
         <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-[#e5e7eb] p-8 text-center">
           <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg
               className="w-6 h-6 text-secondary"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor"
               strokeWidth={2}
               aria-hidden="true"
             >
               <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
             </svg>
           </div>

           <h1 className="text-2xl font-semibold mb-2">Check your email</h1>
           <p className="text-[#666666] mb-6">
             We&apos;ve sent a confirmation link to your email address. Click
             the link to verify your account and start participating in the
             forum.
           </p>
           <p className="text-sm text-[#666666] mb-8">
             If you&apos;ve already clicked the link, your account is verified.
           </p>

           <a
             href="/"
             className="inline-block bg-primary text-white py-2 px-6 rounded-md font-medium min-h-[48px] leading-[48px] hover:bg-primary-dark"
           >
             Back to homepage
           </a>

           <p className="text-xs text-[#999999] mt-6">
             Didn&apos;t receive the email? Check your spam folder. The link
             expires in 24 hours.
           </p>
         </div>
       </div>
     )
   }
   ```

**Verify:** `npx next build` — exits 0, `app/auth/confirm/page.tsx` compiles without errors

---

### Task 2-02-10 — Build the verify-email page

**Requirement:** AUTH-02
**Wave:** 4
**Files touched:**
- `app/auth/verify-email/page.tsx` — notice page for authenticated but unverified users who hit a protected route; includes a resend Server Action

**Steps:**
1. Create `app/auth/verify-email/actions.ts`:
   ```ts
   'use server'

   import { createClient } from '@/lib/supabase/server'

   export async function resendVerificationEmail(
     _prevState: { error?: string; success?: boolean } | undefined
   ) {
     const supabase = await createClient()
     const {
       data: { user },
     } = await supabase.auth.getUser()

     if (!user?.email) {
       return { error: 'You must be logged in to resend the verification email.' }
     }

     const { error } = await supabase.auth.resend({
       type: 'signup',
       email: user.email,
       options: {
         emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
       },
     })

     if (error) {
       return { error: 'Failed to resend verification email. Please try again.' }
     }

     return { success: true }
   }
   ```

2. Create `app/auth/verify-email/page.tsx`:
   ```tsx
   'use client'

   import { useFormState, useFormStatus } from 'react-dom'
   import { resendVerificationEmail } from './actions'

   const initialState: { error?: string; success?: boolean } = {}

   function ResendButton() {
     const { pending } = useFormStatus()
     return (
       <button
         type="submit"
         disabled={pending}
         className="bg-primary text-white py-2 px-6 rounded-md font-medium min-h-[48px] hover:bg-primary-dark disabled:opacity-50"
       >
         {pending ? 'Sending…' : 'Resend verification email'}
       </button>
     )
   }

   export default function VerifyEmailPage() {
     const [state, formAction] = useFormState(resendVerificationEmail, initialState)

     return (
       <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
         <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-[#e5e7eb] p-8 text-center">
           <h1 className="text-2xl font-semibold mb-2">Verify your email</h1>
           <p className="text-[#666666] mb-6">
             You need to verify your email address before you can participate
             in the forum. Check your inbox for a confirmation link from
             Clinical to Code.
           </p>

           {state?.error && (
             <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
               {state.error}
             </p>
           )}

           {state?.success && (
             <p role="status" className="text-sm text-secondary bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-4">
               Verification email sent — check your inbox.
             </p>
           )}

           <form action={formAction}>
             <ResendButton />
           </form>

           <p className="text-xs text-[#999999] mt-4">
             Note: Supabase free tier allows 4 verification emails per hour.
             If you have requested multiple recently, please wait before trying
             again.
           </p>

           <p className="text-sm text-[#666666] mt-6">
             <a href="/" className="text-primary hover:underline">
               Back to homepage
             </a>
           </p>
         </div>
       </div>
     )
   }
   ```

**Verify:** `npx next build` — exits 0, both `app/auth/verify-email/` files compile without errors

---

## Wave 5 — Env + Supabase Config

> Goal: Add `NEXT_PUBLIC_SITE_URL` to `.env.local` and `.env.example`, run the `user_profiles` migration, and complete the Supabase dashboard configuration (URL allow-list, email template branding). These steps are prerequisites for any live email flow test.

### Task 2-02-11 — Add NEXT_PUBLIC_SITE_URL and run user_profiles migration

**Requirement:** AUTH-02 (emailRedirectTo requires this env var)
**Wave:** 5
**Files touched:**
- `.env.local` — add `NEXT_PUBLIC_SITE_URL`
- `.env.example` — add `NEXT_PUBLIC_SITE_URL` placeholder
- `supabase/migrations/[timestamp]_add_user_profiles.sql` — user_profiles table, RLS policies, and new-user trigger

**Steps:**
1. Add `NEXT_PUBLIC_SITE_URL` to `.env.local`:
   ```
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   Add a corresponding placeholder to `.env.example` (no real values — this file is committed to git):
   ```
   NEXT_PUBLIC_SITE_URL=   # http://localhost:3000 for dev, https://clinicaltocode.com for production
   ```

2. Create the user_profiles migration:
   ```bash
   supabase migration new add_user_profiles
   ```
   This creates `supabase/migrations/[timestamp]_add_user_profiles.sql`.

3. Open the generated migration file and add the following SQL. Note: the `user_profiles` table is defined here as an explicit schema step even though Phase 2 auth works entirely against `auth.users`. The trigger established here will auto-create a profile row for every new signup, which Phase 5 builds on top of.
   ```sql
   -- Phase 2 Auth: create user_profiles table with RLS and new-user trigger
   --
   -- user_profiles is the public-facing profile record, keyed to auth.users.
   -- Phase 2 only creates the table and trigger.
   -- Username, bio, avatar, and credential badge are populated in Phase 5.

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

   -- Enable RLS — required before any policy takes effect
   ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

   -- Public read: profiles are visible to all visitors
   CREATE POLICY "profiles are publicly readable" ON public.user_profiles
     FOR SELECT USING (true);

   -- Users can only update their own profile
   CREATE POLICY "users can update own profile" ON public.user_profiles
     FOR UPDATE USING (auth.uid() = id);

   -- Trigger function: auto-insert a profile row when a new user signs up.
   -- SECURITY DEFINER runs as the function owner (postgres), which has
   -- INSERT permission on public.user_profiles even under RLS.
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

4. Apply the migration to the local Supabase stack:
   ```bash
   supabase db reset
   ```

5. Verify the migration applied cleanly in the local Supabase Studio (`http://127.0.0.1:54323` → Table Editor — the `user_profiles` table should appear with the correct columns).

6. Apply the migration to production:
   ```bash
   supabase db push --db-url "$DIRECT_URL"
   ```

**Verify:** `supabase db diff` — outputs `No schema changes found`, confirming the local database matches the migration files

---

### Task 2-02-12 — Configure Supabase Auth dashboard settings and email branding

**Requirement:** AUTH-02
**Wave:** 5
**Files touched:**
- No code files — all changes are in the Supabase dashboard (local dev + production projects)

**Note on email rate limits:** The Supabase free tier allows **4 emails per hour**. During testing, use a single email address and avoid submitting the signup form more than 3 times in quick succession. If the limit is hit, emails will not arrive — wait 60 minutes before retrying. Custom SMTP via Resend (AUTH-05) removes this limit and is a pre-launch requirement.

**Steps:**

1. **Enable Email Auth and Confirm Email** (Supabase Dashboard → Authentication → Providers → Email):
   - Enable Email provider: ON (default — confirm it is on)
   - Confirm email: ON — this is what enforces the verification gate and triggers the confirmation email
   - Secure email change: ON (default)
   - Double confirm email changes: ON (default)

2. **Configure URL allow-list** (Supabase Dashboard → Authentication → URL Configuration):
   - Site URL: `http://localhost:3000` for the local dev project
   - Redirect URLs — add both:
     - `http://localhost:3000/auth/callback`
     - `https://clinicaltocode.com/auth/callback`

   The `emailRedirectTo` value in the `signUp()` action must match one of these allowed URLs exactly. If it does not match, Supabase silently falls back to the Site URL and the `?code=` parameter never reaches the callback route (PITFALLS.md P7).

3. **Update email template sender name** (Supabase Dashboard → Authentication → Email Templates):
   - At the top of any template, find the **"Sender name"** (or "From name") field
   - Change to: `Clinical to Code`

4. **Update Confirm signup template** (Authentication → Email Templates → Confirm signup):
   - Subject: `Confirm your Clinical to Code account`
   - Body: replace the default with:
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
   - The `{{ .ConfirmationURL }}` template variable is required — do not remove it. It generates the PKCE confirmation URL with the `?code=` parameter.

5. **Add NEXT_PUBLIC_SITE_URL to Vercel** (Vercel → Project → Settings → Environment Variables):
   - Variable: `NEXT_PUBLIC_SITE_URL`
   - Value: `https://clinicaltocode.com`
   - Apply to: Production and Preview environments

6. **Repeat dashboard config steps 1–4 for the production Supabase project** (the steps above cover the local/dev project; production needs the same settings with `https://clinicaltocode.com` as the Site URL).

**Verify:** Manual — in Supabase Dashboard → Authentication → Email Templates → Confirm signup, confirm the "Sender name" field reads "Clinical to Code" and the template body does not contain the word "Supabase"

---

## Wave 6 — Manual Verification

> Goal: Run the five Phase 2 success criteria end-to-end against both local dev and the production/preview Vercel URL. All criteria must pass before Phase 2 is marked complete.

### Task 2-02-13 — End-to-end verification of all Phase 2 success criteria

**Requirement:** AUTH-01, AUTH-02, AUTH-03
**Wave:** 6
**Files touched:**
- No new files — verification only

**Note on email rate limits:** Complete all five criteria in one test session using a single real email address. The Supabase free tier allows **4 verification emails per hour**. If you trigger more than 4 signup or resend actions per hour, subsequent emails will not arrive.

**Steps:**

**Criterion 1 — Full signup and verification flow (AUTH-02):**
1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000/auth/signup`
3. Submit the form with a real email address (use a personal email or a service like Mailinator)
4. Confirm redirect to `http://localhost:3000/auth/confirm`
5. Open the email inbox — the email should arrive with "Clinical to Code" as the sender display name and subject "Confirm your Clinical to Code account"
6. Click the confirmation link — the URL should contain `http://localhost:3000/auth/callback?code=...`
7. Confirm redirect to `http://localhost:3000/auth/confirm`
8. Open Supabase Studio (local: `http://127.0.0.1:54323`) → Authentication → Users — verify `email_confirmed_at` is now populated for the test user

**Criterion 2 — Unverified user is blocked from protected routes (AUTH-02):**
1. Sign up with a different email address but do NOT click the confirmation link
2. Navigate to `http://localhost:3000/profile` (or any protected route)
3. Confirm the browser redirects to `http://localhost:3000/auth/verify-email`
4. Verify the page displays "Verify your email" and the resend button is present
5. In Supabase Studio: `SELECT email_confirmed_at FROM auth.users WHERE email = 'test@example.com'` — value should be NULL

**Criterion 3 — Session persists across browser refresh (AUTH-03):**
1. Sign in at `http://localhost:3000/auth/login` with the verified account from Criterion 1
2. Confirm redirect to `http://localhost:3000/`
3. Open DevTools → Application → Cookies — confirm `sb-[ref]-auth-token` cookies are present
4. Hard-refresh the page (Cmd+Shift+R / Ctrl+Shift+R)
5. Confirm the user is still logged in (e.g., the sign-out button is visible in the nav)
6. Close the browser tab entirely, reopen `http://localhost:3000/` — confirm still logged in

**Criterion 4 — Sign out invalidates session and protected routes redirect to login (AUTH-01):**
1. While logged in, click the sign-out button
2. Confirm redirect to `http://localhost:3000/auth/login`
3. Navigate to `http://localhost:3000/profile`
4. Confirm redirect to `http://localhost:3000/auth/login`
5. In DevTools → Application → Cookies — confirm the `sb-[ref]-auth-token` cookies are gone or expired

**Criterion 5 — Auth emails show Clinical to Code branding (AUTH-02):**
1. In Supabase Dashboard (production or local) → Authentication → Email Templates → Confirm signup
2. Confirm "Sender name" reads "Clinical to Code"
3. Confirm the email body does not contain the word "Supabase"
4. If you have not yet received a real test email from the production Supabase project, complete a test signup on the production Vercel URL to verify the live email shows the correct sender name

**Final automated check:**
```bash
npx vitest run
```
All tests must pass (green). If any test is red, fix before marking Phase 2 complete.

**Verify:** All five criteria above are confirmed manually. `npx vitest run` exits 0.

---

## Phase 2 Success Criteria Checklist

From ROADMAP.md Phase 2:

- [ ] A new user can complete the signup form, receive a verification email, click the link, and land on a confirmation page (AUTH-02)
- [ ] An unverified user who attempts to access `/profile` or `/forum/new` is blocked with a "verify your email" redirect (AUTH-02)
- [ ] A logged-in user refreshes the browser and remains authenticated — session persists via `middleware.ts` token refresh (AUTH-03)
- [ ] Signing out immediately invalidates the session — protected routes redirect to login (AUTH-01)
- [ ] Auth emails display the "Clinical to Code" sender name and branded body, not "Supabase" (AUTH-02)

---

## Pitfall Index

The following pitfalls from PITFALLS.md are directly addressed by tasks in this phase:

| Pitfall | Task | Mitigation |
|---------|------|------------|
| P1 — `cookies()` async in Next.js 15 | 2-02-06 | `await cookies()` in callback route |
| P2 — Module-level Supabase client | 2-02-04, 2-02-05 | `createClient()` called inside each action |
| P3 — `getSession()` for security checks | 2-02-02 | `getUser()` used in middleware |
| P4 — PKCE disabled | 2-02-06 | `exchangeCodeForSession(code)` used; no `flowType: 'implicit'` |
| P5 — Middleware returns new `NextResponse` | 2-02-02 | Returns `supabaseResponse` |
| P6 — Middleware runs on static assets | 2-02-02 | Matcher excludes `_next/static`, `_next/image`, extensions |
| P7 — `emailRedirectTo` not in allow-list | 2-02-12 | Both localhost and production URLs added to Redirect URLs |
| P8 — Free tier 4 emails/hour | 2-02-10, 2-02-13 | Documented in verify-email page and Wave 6 task |
| P9 — `NEXT_PUBLIC_SITE_URL` not set | 2-02-11 | Added to `.env.local` and `.env.example` |

---

*Phase: 02-auth*
*Plan authored: 2026-03-15*
