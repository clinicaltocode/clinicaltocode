# Stack Research

**Project:** Clinical to Code — Next.js 15 App Router rebuild
**Date:** 2026-03-15
**Scope:** Greenfield rebuild covering content, community forum, auth, subscriptions, ads, newsletter, and Vercel deployment

---

## Recommended Stack

| Layer | Library / Service | Version | Rationale | Confidence |
|-------|------------------|---------|-----------|------------|
| **Framework** | Next.js | 15.x | App Router, React Server Components, streaming, built-in image/font optimization. Required by project constraints. | High |
| **Language** | TypeScript | 5.x | Required by project constraints. Type safety is essential for a multi-feature codebase maintained solo. | High |
| **Styling** | Tailwind CSS | 4.x | Required by project constraints. Utility-first, co-located styles, minimal runtime overhead. v4 ships a new engine (Oxide) with faster builds. | High |
| **CMS** | Sanity | v3 (latest) | Structured content, hosted Studio UI (no code to publish), excellent Next.js 15 integration via `next-sanity`, GROQ query language, generous free tier, real-time content previews with Presentation tool. Required by project constraints. | High |
| **Sanity integration** | next-sanity | 9.x | Official Sanity toolkit for Next.js App Router. Provides `sanityFetch`, draft-mode/live preview, revalidation hooks, and typed GROQ results via `@sanity/client`. | High |
| **Database** | Supabase (hosted Postgres) | latest | Managed Postgres 15 on AWS. Built-in PgBouncer connection pooler on port 6543 — this is the direct solution to the v0 disconnection issues. Free tier is generous, scales to Pro without migration. Row Level Security (RLS) for community data isolation. | High |
| **ORM / Query** | Drizzle ORM | 0.39.x | Lightweight TypeScript ORM with zero runtime cost, full SQL expressiveness, first-class support for Supabase's pooled connection string. Migrations are SQL files you control — no migration blackbox. Significantly lighter than Prisma for serverless. | High |
| **DB connection** | postgres (node-postgres alternative via Drizzle) | via `drizzle-orm/postgres-js` + `postgres` 3.x | `postgres` (the `postgres` npm package) is the recommended driver for serverless/edge with Drizzle. It handles connection reuse correctly with PgBouncer transaction-mode pooling. Must use the Supabase **pooler** connection string (port 6543), NOT the direct connection (port 5432). | High |
| **Authentication** | Supabase Auth | built-in | Email/password, email verification, password reset, and session management are all first-party features. Integrates with the same Supabase project — no separate auth service needed. Uses JWTs stored in cookies, compatible with Next.js App Router middleware. No need for NextAuth/Auth.js for this use case. | High |
| **Supabase SSR helpers** | @supabase/ssr | 0.5.x | Official package for Next.js App Router cookie-based session handling. Replaces the deprecated `@supabase/auth-helpers-nextjs`. Required for server components, server actions, and middleware to access the authenticated user. | High |
| **Payments / Subscriptions** | Stripe | stripe 17.x + @stripe/stripe-js 4.x | Industry standard. Handles paid membership tiers, recurring billing, webhooks, and customer portal. Stripe's hosted checkout removes PCI scope from the app entirely. | High |
| **Email delivery** | Resend | resend 4.x | Modern transactional email API with a generous free tier (3,000 emails/month). First-class React Email support for templated auth and newsletter emails. Simple REST API. | High |
| **Email templates** | React Email | react-email 3.x | Build email templates as React components, previewed in browser. Works with Resend natively. Eliminates hand-written HTML email maintenance. | High |
| **Newsletter** | Loops | loops-sdk or direct API | Purpose-built newsletter + email automation SaaS. Integrates with Resend or can act as the primary email platform. Alternative: use Resend Broadcasts (in beta as of early 2025) for a single-vendor approach. See Notes for decision guidance. | Medium |
| **Validation** | Zod | 3.x | Schema validation for form inputs, API routes, Sanity content projections, and Stripe webhook payloads. De facto standard in the Next.js ecosystem. | High |
| **Forms** | React Hook Form | 7.x | Performant uncontrolled forms with first-class Zod integration via `@hookform/resolvers`. | High |
| **UI components** | shadcn/ui | latest CLI | Not a package — a collection of copy-owned Radix UI + Tailwind components. No version lock-in, fully customizable, accessible by default, well-suited for a solo operator who needs a component baseline without design debt. | High |
| **Icons** | Lucide React | 0.468.x | Consistent icon set used by shadcn/ui. Lightweight, tree-shakeable. | High |
| **Deployment** | Vercel | — | Required by project constraints. Native Next.js 15 support, automatic preview deployments per branch, edge network, Vercel Analytics, and native Sanity webhook support. | High |
| **Environment secrets** | Vercel Environment Variables | — | Manage `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `SANITY_API_TOKEN` etc. per environment (preview / production). | High |
| **Ads** | Google AdSense | — | Script tag integration via Next.js `<Script>` component with `strategy="afterInteractive"`. No npm package — AdSense is a browser-side script. | High |
| **Rate limiting** | @upstash/ratelimit + @upstash/redis | latest | Serverless-compatible Redis-backed rate limiting for auth endpoints, forum post submission, and upvote actions. Upstash free tier covers typical early-stage traffic. Alternative if cost is a concern: simple in-memory limiting in middleware (less reliable across serverless instances). | Medium |
| **Date formatting** | date-fns | 4.x | Lightweight, tree-shakeable, no timezone runtime dependency by default. | High |
| **Linting / Formatting** | ESLint 9 + Prettier | latest | ESLint flat config (9.x) is the current standard. Prettier for code formatting. Use `eslint-config-next` and `eslint-plugin-tailwindcss`. | High |

---

## What NOT to Use

| Avoid | Reason |
|-------|--------|
| **Prisma with direct Postgres connection** | Prisma is excellent but its query engine maintains a long-lived connection that is incompatible with serverless cold starts. Without PgBouncer in transaction mode, every Vercel function invocation can exhaust the Postgres `max_connections` limit. This is the most likely root cause of the v0 site's database disconnection errors. If Prisma is used at all, it must be combined with a pooler — but Drizzle is lighter, faster, and avoids the binary engine entirely. |
| **Prisma Accelerate** | A paid Prisma layer to solve the connection problem Prisma itself creates. Adds cost and a proprietary vendor dependency to fix an avoidable problem. Drizzle + Supabase pooler achieves the same outcome for free. |
| **NextAuth / Auth.js** | Adds significant complexity (adapter, database tables, session strategy decisions) when Supabase Auth already provides email/password, verification, and password reset out of the box and integrates directly with the database you're already using. Avoid for v1. |
| **PlanetScale** | PlanetScale removed its free tier in 2024 and uses MySQL with a non-standard branching workflow. Supabase offers a more complete managed Postgres experience with a free tier that scales. |
| **Neon serverless Postgres** | Neon is a credible alternative to Supabase but offers only the database — no auth, no storage, no realtime. Since Supabase provides all of these in one project, Neon adds unnecessary vendor split. |
| **Firebase / Firestore** | NoSQL document model is a poor fit for the relational community forum data model (users → threads → replies → upvotes). SQL joins and RLS are cleaner here. |
| **Clerk Auth** | Strong product but adds $25+/month cost at modest scale (Supabase Auth is free within the same project), and creates a dependency on an auth vendor separate from your database. Reconsider for v2 if Supabase Auth proves limiting. |
| **tRPC** | Valuable in large TypeScript monorepos with many API consumers. For a solo Next.js app with server actions and a handful of API routes, tRPC adds boilerplate without meaningful benefit. Use server actions + Zod instead. |
| **Contentlayer / MDX for content** | Requires content to live in the repo as markdown files. The project explicitly requires Sanity's non-developer editor UI — this approach is out of scope. |
| **Supabase direct connection (port 5432) in serverless** | Must use the pooler connection string (port 6543, transaction mode) in all Vercel functions and server actions. The direct connection is only appropriate for long-lived processes (migrations, local dev seeding). This is the specific technical fix for the v0 disconnection issues. |
| **Edge Runtime for database queries** | Vercel's Edge Runtime does not support TCP connections, which means standard Postgres drivers do not work. All server actions and API routes that query Supabase must use the Node.js runtime (the default). Only use Edge Runtime for lightweight middleware (auth session checks, redirects). |

---

## Key Decisions

### 1. Database Connection Pooling — The Core Fix

The v0 site's disconnection issues stem from serverless functions opening new Postgres connections on each invocation without a pooler. The fix is precise:

- Use **Supabase's built-in PgBouncer** on port `6543` in **transaction mode**
- Set the connection string via `DATABASE_URL` to the `postgresql://...@aws-0-us-east-1.pooler.supabase.com:6543/postgres` format (available in the Supabase dashboard under Settings → Database → Connection pooling)
- Use **Drizzle ORM with the `postgres` driver**, configured to use this pooler URL
- Set `prepare: false` in the `postgres()` client config — PgBouncer transaction mode does not support prepared statements

This setup means each serverless invocation borrows a connection from the pool, executes its queries, and returns it — no lingering connections, no exhausted `max_connections`.

### 2. Auth Architecture

Supabase Auth is the correct choice because:
- It lives in the same project as the database — user records in `auth.users` can be referenced by foreign keys in `public.profiles`, forum threads, etc.
- Row Level Security policies can reference `auth.uid()` to enforce per-user data access without application-layer checks
- The `@supabase/ssr` package handles the cookie/session complexity for Next.js App Router correctly
- Email verification and password reset are built-in with no configuration beyond an SMTP provider (Resend can serve as the SMTP provider for Supabase Auth emails)

### 3. CMS vs. Database Boundary

**Sanity manages:** Article content, author profiles, categories, tags, hero images, featured post selections, sponsorship/partner slots. This content is editorial, infrequently updated, and benefits from draft/preview workflows.

**Supabase manages:** Community forum data (threads, replies, upvotes), user profiles, membership/subscription status, newsletter subscribers. This is transactional, user-generated data that requires relational integrity and RLS.

Do not put forum data in Sanity — it has no relational model, no row-level permissions, and is billed by API usage. Do not put article content in Supabase — it lacks a structured editor UI.

### 4. Subscription Tier Implementation

- Use **Stripe Checkout** (hosted) to avoid handling payment details in-app
- Store subscription status in a `subscriptions` table in Supabase, updated via Stripe webhooks (`customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`)
- Gate premium content/forum access by checking `subscription.status = 'active'` via RLS or a server-side check in the relevant layouts
- Use the **Stripe Customer Portal** for self-service subscription management (cancel, update card)

### 5. Newsletter

Two credible approaches:

**Option A: Resend Broadcasts (simpler)** — Use Resend as a single vendor for both transactional emails (auth, receipts) and newsletter broadcasts. Resend Broadcasts reached general availability in 2024. This keeps vendors minimal but the newsletter features (segmentation, automation) are less mature than dedicated tools.

**Option B: Loops (purpose-built)** — Loops is a SaaS newsletter + lifecycle email platform with a generous free tier, designed for SaaS/indie products. Sync newsletter subscribers to Loops via its API and use Resend only for transactional emails. More capable for newsletter management but adds a second email vendor.

**Recommendation:** Start with **Resend Broadcasts** (Option A) for v1. If newsletter functionality becomes a growth lever, migrate to Loops at that point.

---

## Notes

- **Sanity free tier** includes 3 users, 10GB bandwidth, 2 datasets — sufficient for a solo-operated site well into production
- **Supabase free tier** includes 500MB database storage, 5GB bandwidth, 50,000 monthly active users for Auth — sufficient for early-stage; upgrade to Pro ($25/month) when storage or traffic requires
- **Stripe** charges 2.9% + 30¢ per transaction; no monthly fee until revenue starts
- **Resend free tier** is 3,000 emails/month and 100/day — sufficient for transactional email and a small newsletter audience at launch
- **Vercel free (Hobby) tier** is sufficient for a solo project; the Pro plan ($20/month) adds team features, higher limits, and removes the 10-second function timeout — consider Pro once the forum is live and traffic is real
- **shadcn/ui** requires running the CLI to add components into your codebase — there is no package to install. Components live in `components/ui/` and are fully owned. This is intentional: no upstream breaking changes, full customization control
- **Drizzle Kit** is the companion CLI for schema management (`drizzle-kit generate`, `drizzle-kit migrate`) — treat migrations as committed SQL files in version control
- Upstash Redis for rate limiting requires a free Upstash account — it does not add to Vercel or Supabase cost
- Google AdSense requires site approval; apply early as the approval process can take 2–4 weeks after launch

---

*Research completed: 2026-03-15*
