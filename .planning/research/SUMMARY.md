# Research Summary

**Project:** Clinical to Code — Next.js 15 App Router rebuild
**Date:** 2026-03-15

---

## Recommended Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 (App Router) | RSC, streaming, ISR, Vercel-native |
| Language | TypeScript 5.x | Type safety across a multi-feature solo codebase |
| Styling | Tailwind CSS 4.x | Utility-first, zero runtime, Oxide engine |
| CMS | Sanity v3 + next-sanity 9.x | Structured content, hosted Studio, GROQ, ISR webhooks |
| Database | Supabase (Postgres 15) | Managed DB + Auth + Storage in one project; generous free tier |
| ORM | Drizzle ORM 0.39.x | Lightweight, serverless-safe, SQL migrations you own |
| DB Connection | postgres driver via PgBouncer (port 6543) | Solves the v0 disconnection failures; transaction-mode pooling |
| Auth | Supabase Auth + @supabase/ssr 0.5.x | Email/password, verification, reset — built into the DB project |
| Payments | Stripe (stripe 17.x + hosted Checkout) | Industry standard; hosted checkout removes PCI scope |
| Email | Resend 4.x + React Email 3.x | 3k/month free; React component templates; double opt-in |
| Newsletter | Resend Broadcasts (v1) | Single vendor; migrate to Loops if growth demands it |
| Validation | Zod 3.x | Forms, API routes, Stripe webhooks, Sanity projections |
| Forms | React Hook Form 7.x + @hookform/resolvers | Performant, uncontrolled, Zod-integrated |
| UI Components | shadcn/ui (Radix + Tailwind) | Copy-owned, accessible, no version lock-in |
| Deployment | Vercel | Required; native Next.js 15, preview deploys, edge network |
| Rate Limiting | @upstash/ratelimit + Redis | Serverless-safe; covers auth, forum post, and vote endpoints |
| Ads | Google AdSense via Next.js Script | Browser-side only; apply after 15+ articles published |

---

## Table Stakes Features

These must exist at v1 launch. Absence causes immediate abandonment.

- Email/password signup and login with persistent sessions
- Email verification required before allowing forum participation
- Password reset via email (branded, not "Supabase" sender)
- Public user profiles — username, join date, post history
- Clean, mobile-responsive article pages with author byline, read time, and category
- Article index with category filters and pagination
- Basic site search across articles and forum posts
- Shareable canonical URLs for articles and threads
- Threaded forum discussions (2-level nesting minimum)
- Upvote on posts and replies (no downvotes — intentional)
- Forum categories organized by clinical specialty
- Thread creation for authenticated + verified users; public read access
- Report button feeding an admin-reviewable reports table
- Admin soft-delete and user-ban controls before any public launch
- Newsletter signup with double opt-in
- 404, error pages, and clear articles/community navigation separation
- Fast page loads (articles via ISR/CDN; forum via server-side + pooled DB)

---

## Key Differentiators

What makes this platform worth using over Reddit or generic forums.

- **Role/credential badges on profiles** — self-reported "RN", "NP", "CMIO" labels signal a professional space without v1 verification overhead; changes community self-policing behavior
- **Author credential display on articles** — "Staff Nurse, 12 years ICU experience" bylines build credibility that Medscape and generic blogs do not offer to frontline contributors
- **Upvote-only (no downvotes)** — avoids pile-ons and silencing of minority clinical opinions; keeps tone constructive (Hacker News model)
- **"Discuss this article" thread type** — forum threads spawned directly from articles create a content-discussion virtuous loop; articles drive threads, threads drive return visits
- **Clinical case thread type** — designated post format for de-identified case discussions (Figure 1's core engagement driver); clinicians are trained to learn from cases
- **Clinical specialty filtering** — informatics users do not want nursing workflow posts; topic-level filtering keeps signal-to-noise high
- **Curated "Editor's Pick" and featured threads** — human-curated feed surfaces quality over recency; manageable for a solo operator
- **Bookmarked/saved posts** — clinicians return to reference threads; bookmarking encourages repeat visits
- **Community guidelines tuned to clinical discourse** — explicit norms around de-identification, no patient details, civil clinical disagreement; prominently posted to signal platform identity
- **Forum threads indexed by Google** — public read access makes threads crawlable; long-tail clinical search queries ("Epic downtime workflow nursing") are a significant acquisition channel Reddit has proven at scale
- **Structured data on articles** — schema.org `Article` / `HealthTopicContent` JSON-LD improves SERP appearance for clinical content

---

## Critical Pitfalls to Avoid

| # | Pitfall | Phase |
|---|---------|-------|
| 1 | Use PgBouncer pooler (port 6543), never direct Postgres (port 5432), in serverless functions — this is the exact cause of v0 disconnection failures | Infrastructure setup (before any feature work) |
| 2 | Create the Supabase client per-request inside Server Components and Actions using `@supabase/ssr`; never at module level — module-level clients leak auth context between users | Auth scaffold |
| 3 | Enable RLS on every user-generated-content table; never trust `user_id` from the client — derive it from `auth.uid()` in policies | Auth + data model (before any public feature ships) |
| 4 | Run all schema changes through Supabase CLI migration files in version control; never paste SQL into the dashboard — the production schema must be reproducible | Project initialization |
| 5 | Add composite indexes on forum tables at migration time (category + created_at, category + vote_count, thread_id for replies) — sequential scans at even modest scale cause timeouts | Schema design |
| 6 | Use atomic Postgres RPC functions for vote logic — application-level `vote_count + 1` is a race condition that silently loses votes under concurrent load | Forum schema + API design |
| 7 | Customize Supabase Auth email templates and set a custom SMTP sender (`@clinicaltocode.com` via Resend) before opening any signup flow — default "Supabase" sender emails trigger phishing flags in a clinical audience | Auth scaffold |
| 8 | Reserve fixed-height containers for AdSense slots and load the script with `strategy="lazyOnload"` — unconstrained auto-ads cause CLS that degrades Core Web Vitals and search ranking | Monetization implementation |
| 9 | Gate premium content in server components and RLS policies, never only in client-side UI — technical users can bypass client-only checks | Monetization |
| 10 | Implement token refresh in `middleware.ts` on every request using the official `@supabase/ssr` pattern — without it users are silently logged out mid-session | Auth scaffold |

---

## Build Order

| Phase | Goal |
|-------|------|
| 0 — Foundation | Initialize Next.js 15 + TypeScript + Tailwind; configure Supabase and Sanity projects; set all env vars; deploy skeleton to Vercel |
| 1 — Auth | Build signup, login, callback, reset, and update-password flows; write middleware for session refresh and route protection; add Supabase trigger for user_profiles; customize all auth emails |
| 2 — Content / Articles | Define Sanity schemas; build article index and article detail pages with ISR; wire Sanity webhook for on-demand revalidation; publish first real article as smoke test |
| 3 — Forum | Create Supabase schema migrations with indexes and RLS; build category list, thread list, thread detail, reply, and vote surfaces using Server Actions; add admin soft-delete and report tooling |
| 4 — User Profiles | Build public profile pages and settings page (edit display name, bio, credentials, avatar via Supabase Storage) |
| 5 — Monetization | Add AdSense script and AdUnit components; wire newsletter signup to Resend; integrate Stripe Checkout and webhook for membership tier; add premium content gate in server components |
| 6 — Polish + SEO | Add `generateMetadata` to all dynamic routes; create sitemap.ts and robots.ts; add JSON-LD structured data; audit Core Web Vitals; apply to AdSense after 15+ articles are live |
