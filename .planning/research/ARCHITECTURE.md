# Architecture Research

**Project:** Clinical to Code — Next.js 15 App Router rebuild
**Stack:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + Sanity CMS + Supabase
**Date:** 2026-03-15

---

## System Components

The application divides cleanly into four bounded domains. Each domain has its own data source, rendering strategy, and routing namespace.

---

### 1. CMS / Content Domain (Sanity)

**Responsibility:** Articles, authors, categories, tags, featured content, hero sections.

**What lives here:**
- Article schema (title, slug, body as Portable Text, author reference, category, tags, publishedAt, readTime, featuredImage)
- Author schema (name, bio, credentials, avatar, specialty)
- Category schema (name, slug, description — maps to clinical topics)
- Site settings schema (hero article reference, featured article list)

**Rendering strategy:** Static generation with ISR (Incremental Static Regeneration).
- `/articles/[slug]` — `generateStaticParams` at build time, revalidate on Sanity webhook
- `/articles` (index) — ISR with short revalidation interval (60–300s)
- `/` (homepage hero) — ISR, revalidated when Sanity content changes

**Who touches this domain:** Only the solo operator via Sanity Studio. No user-generated content enters Sanity.

**Sanity Studio deployment:** Hosted at `/studio` route inside the Next.js app using `next-sanity`'s embedded studio, OR deployed separately at `studio.clinicaltocode.com`. Embedded is simpler for a solo operator.

---

### 2. Community / Forum Domain (Supabase)

**Responsibility:** Forum categories, threads (posts), replies, upvotes, user profiles.

**Database schema (Supabase Postgres):**
```
forum_categories    id, name, slug, description, icon, display_order
forum_threads       id, category_id, author_id, title, body, upvotes, created_at, updated_at, is_pinned, is_locked
forum_replies       id, thread_id, parent_reply_id (nullable), author_id, body, upvotes, created_at
thread_votes        user_id, thread_id, vote (1 or -1) — unique(user_id, thread_id)
reply_votes         user_id, reply_id, vote (1 or -1) — unique(user_id, reply_id)
user_profiles       id (FK → auth.users), username, display_name, bio, credentials, avatar_url, created_at
```

**Rendering strategy:** Dynamic server-side rendering + client components.
- `/forum` (category list) — server component, reads from Supabase
- `/forum/[category]` (thread list) — server component with pagination
- `/forum/[category]/[thread]` (thread detail + replies) — server component, nested replies hydrated client-side for voting interactions
- `/forum/new` (create thread) — client component, requires auth

**Connection pooling:** Supabase's built-in PgBouncer (transaction mode) via the pooled connection string. This directly addresses the v0 disconnection failures. Use `@supabase/ssr` package with the pooled URL for all server-side reads/writes.

**Row Level Security (RLS):** Enable on all forum tables.
- Threads/replies: `SELECT` public, `INSERT/UPDATE/DELETE` requires `auth.uid() = author_id`
- Votes: `INSERT/UPDATE` requires authenticated user
- User profiles: users can only update their own row

---

### 3. Auth Domain (Supabase Auth)

**Responsibility:** Email/password signup, email verification, session management, password reset.

**What lives here:**
- Supabase Auth handles the `auth.users` table natively
- A `user_profiles` table in the public schema (created via trigger on `auth.users` insert) holds public-facing profile data
- Auth state is managed via `@supabase/ssr` cookies — server-readable session tokens

**Key routes:**
- `/auth/signup` — email + password form, calls `supabase.auth.signUp()`
- `/auth/login` — calls `supabase.auth.signInWithPassword()`
- `/auth/callback` — handles the email verification redirect from Supabase
- `/auth/reset-password` — initiates password reset email
- `/auth/update-password` — form shown after clicking reset link

**Middleware:** A Next.js middleware file (`middleware.ts`) at the project root runs on every request to:
1. Refresh the Supabase session cookie if it's close to expiry
2. Redirect unauthenticated users away from protected routes (`/forum/new`, `/profile`, etc.)
3. Redirect authenticated users away from `/auth/login` and `/auth/signup`

The middleware uses `@supabase/ssr`'s `createServerClient` with `request`/`response` cookie methods.

---

### 4. Monetization / Growth Domain

**Responsibility:** AdSense placements, newsletter signups, paid membership gate, sponsor slots.

**What lives here:**
- Google AdSense script loaded in root layout — placements as client components (AdUnit) in article and forum layouts
- Newsletter: a simple form that POSTs to a Next.js API route (`/api/newsletter`) which calls the email provider API (e.g., Resend, Mailchimp, ConvertKit)
- Paid membership: Supabase stores a `membership_tier` column on `user_profiles`. Stripe webhook updates this on successful payment. A Next.js API route (`/api/stripe/webhook`) handles the Stripe event.
- Premium content gate: server components check `user.membership_tier` before rendering gated content. No client-side gating — always enforce on the server.
- Sponsor slots: static data in Sanity (a "Sponsors" document type) or hardcoded until there are real sponsors

---

## Data Flow

### Content Flow (Read-only, Sanity → Next.js)

```
Sanity Studio (editor UI)
    │
    │  GROQ query over HTTPS (CDN-backed)
    ▼
Next.js Server Component (build time or ISR revalidation)
    │
    │  renders HTML
    ▼
Browser (static HTML, no client JS for content reads)
```

- At build: `generateStaticParams` fetches all article slugs via GROQ.
- At request (ISR): cached response served from Vercel CDN; background revalidation triggered by Sanity webhook hitting `/api/revalidate`.
- Sanity's CDN handles read caching — queries use `useCdn: true` in production. The revalidation API route uses the Supabase client with `useCdn: false` to get fresh data.

### Forum Flow (Read + Write, Supabase ↔ Next.js)

```
Browser
    │
    │  page navigation (RSC)
    ▼
Next.js Server Component
    │  reads via @supabase/ssr server client (pooled connection)
    ▼
Supabase Postgres (PgBouncer pool)

Browser (client component: vote button, reply form)
    │
    │  calls Next.js Server Action or API Route
    ▼
Next.js Server Action (validates session, writes to Supabase)
    │
    ▼
Supabase Postgres (RLS enforced)
    │
    ▼
Server Action returns updated state → optimistic UI update in browser
```

Prefer **Server Actions** over API routes for form submissions (create thread, post reply, vote). Server Actions run on the server, have access to the session cookie, and avoid a separate round-trip for the client.

### Auth Flow

```
Browser submits signup/login form
    │
    ▼
Next.js Server Action (calls supabase.auth.signUp / signInWithPassword)
    │
    ▼
Supabase Auth service
    │  issues session → sets httpOnly cookie via @supabase/ssr
    ▼
Browser redirect to /forum (or intended destination)

Subsequent requests:
Browser → middleware.ts reads cookie → creates server Supabase client
    → refreshes token if needed → session available in all server components
```

### Payment Flow (Stripe + Supabase)

```
Browser → Stripe Checkout (redirect)
    │
    ▼
Stripe processes payment
    │  webhook POST
    ▼
/api/stripe/webhook (Next.js API route)
    │  verifies Stripe signature
    │  updates user_profiles.membership_tier in Supabase
    ▼
User session reflects new tier on next request
```

---

## Suggested Build Order

Each phase produces a shippable increment. Later phases depend on earlier ones being stable.

### Phase 0 — Project Foundation (prerequisite for everything)

1. Initialize Next.js 15 project with TypeScript and Tailwind CSS
2. Configure ESLint, Prettier, and path aliases
3. Set up Supabase project — get connection strings (pooled + direct), enable email auth
4. Set up Sanity project — define initial schemas (article, author, category)
5. Configure environment variables (`.env.local`) — Sanity project ID/dataset, Supabase URL/anon key/service role key
6. Deploy skeleton to Vercel with environment variables set

**Why first:** Every other phase depends on the configured services and deployment pipeline being stable.

### Phase 1 — Auth (prerequisite for forum and payments)

1. Install `@supabase/ssr`
2. Write `middleware.ts` for session refresh and route protection
3. Build `/auth/signup`, `/auth/login`, `/auth/callback`, `/auth/reset-password`, `/auth/update-password` pages
4. Create Supabase trigger to auto-insert `user_profiles` row on new auth user
5. Test email verification flow end-to-end

**Why second:** The forum requires authenticated users. Membership gating requires auth. Building auth before forum prevents rework.

### Phase 2 — Content / Articles (independent of forum, can ship early)

1. Define Sanity schemas and deploy Sanity Studio (embedded at `/studio` or external)
2. Write GROQ queries for article list, single article, featured article
3. Build `/articles` index page (server component, ISR)
4. Build `/articles/[slug]` page (server component, `generateStaticParams`, ISR)
5. Build homepage with featured article hero section
6. Set up `/api/revalidate` route with Sanity webhook secret for on-demand ISR
7. Publish first real article as smoke test

**Why third:** Content is the site's credibility foundation and is fully independent of Supabase. Can go live before the forum is built.

### Phase 3 — Forum (depends on Phase 0 + Phase 1)

1. Create Supabase schema migrations (forum_categories, forum_threads, forum_replies, votes tables)
2. Enable RLS and write policies for each table
3. Seed forum categories (Nursing, EHR, Informatics, Pharmacy, etc.)
4. Build `/forum` category list (server component)
5. Build `/forum/[category]` thread list with pagination (server component)
6. Build `/forum/[category]/[thread]` thread detail with nested replies (server component + client voting)
7. Build `/forum/new` thread creation form (Server Action, auth required)
8. Build reply form within thread page (Server Action, auth required)
9. Implement upvote Server Actions with optimistic UI

**Why fourth:** Forum is the most complex domain. Auth must be solid before building user-facing write operations.

### Phase 4 — User Profiles (depends on Phase 1 + Phase 3)

1. Build `/profile/[username]` public profile page showing threads/replies authored
2. Build `/profile/edit` settings page (update display name, bio, credentials, avatar)
3. Avatar upload via Supabase Storage

### Phase 5 — Monetization (depends on Phase 1 + Phase 2)

1. Add AdSense script to root layout; build reusable `AdUnit` client component; place in article layout and forum layouts
2. Build newsletter signup form + `/api/newsletter` API route wired to email provider
3. Integrate Stripe — add Stripe product for membership tier, build checkout flow
4. Build `/api/stripe/webhook` route to update `user_profiles.membership_tier`
5. Add premium content gate in article server components

### Phase 6 — Polish and SEO

1. Add `generateMetadata` to all dynamic routes (articles, forum threads)
2. Add `sitemap.ts` and `robots.ts` in app directory
3. Structured data (JSON-LD) for articles (Article schema)
4. Open Graph images (Next.js `opengraph-image.tsx` convention)
5. Performance audit — check Core Web Vitals, ensure no client JS on static article pages

---

## Sanity + Supabase Coexistence

The two services never talk to each other — Next.js is the only integration point. They occupy completely separate namespaces.

### Environment variable separation

```
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=...         # server-only, for revalidation route
SANITY_WEBHOOK_SECRET=...         # server-only, for /api/revalidate

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...     # server-only, never in NEXT_PUBLIC_
DATABASE_URL=...                   # pooled connection string (PgBouncer)
DIRECT_URL=...                     # direct connection string (for migrations)
```

### Client instantiation pattern

Create two separate client factory files to keep concerns isolated:

- `lib/sanity/client.ts` — exports a `sanityClient` using `createClient` from `next-sanity`. Used only in server components and the revalidation API route. Never imported in client components.
- `lib/supabase/server.ts` — exports `createServerClient` from `@supabase/ssr` configured with Next.js cookies. Used in server components, Server Actions, and middleware.
- `lib/supabase/client.ts` — exports `createBrowserClient` from `@supabase/ssr`. Used only in client components that need to call Supabase directly (auth state listener, if needed).

### Route co-location

Both domains live in the same Next.js `app/` directory without conflict:

```
app/
  (marketing)/          # homepage, about — uses Sanity
  articles/             # CMS content — uses Sanity only
    [slug]/
  studio/               # Sanity Studio (embedded)
  forum/                # community — uses Supabase only
    [category]/
      [thread]/
    new/
  auth/                 # auth flows — uses Supabase Auth only
    signup/
    login/
    callback/
  profile/              # user data — uses Supabase only
    [username]/
    edit/
  api/
    revalidate/         # Sanity webhook → Next.js ISR
    newsletter/         # email provider integration
    stripe/
      webhook/          # Stripe → Supabase membership update
```

### Rendering strategy summary by domain

| Domain     | Primary source | Rendering strategy        |
|------------|---------------|--------------------------|
| Articles   | Sanity        | Static + ISR             |
| Homepage   | Sanity        | ISR                      |
| Forum      | Supabase      | Dynamic SSR              |
| Auth pages | Supabase Auth | Dynamic SSR              |
| Profile    | Supabase      | Dynamic SSR              |

This split means the content side benefits from CDN-level caching and near-zero database load, while the community side gets fresh data on every request with connection pooling preventing the disconnection issues that plagued the v0 implementation.

### Why this split avoids the v0 disconnection problem

The v0 site used a direct Postgres connection in a serverless context — each Vercel function invocation attempted a new TCP connection, and connection limits were hit quickly under any real load. Supabase's PgBouncer (transaction-mode pooling) sits in front of Postgres and maintains a persistent connection pool. Next.js functions connect to PgBouncer, not directly to Postgres. Each transaction borrows a connection from the pool and returns it immediately, making this pattern safe for serverless.

The `DATABASE_URL` (pooled) is used at runtime. The `DIRECT_URL` (non-pooled) is used only by migration tools (e.g., Prisma migrate, Supabase CLI) which need a persistent connection to run DDL statements.

---

*Research complete. No implementation decisions are locked until the roadmap phase is authored.*
