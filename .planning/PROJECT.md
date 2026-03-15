# Clinical to Code

## What This Is

A dual-purpose healthcare platform that bridges clinical expertise and healthcare IT — combining a **content hub** (articles from nurses, physicians, pharmacists, and informaticists) with a **community forum** (Reddit-style discussion where clinicians and IT professionals connect). Solo-run by a founder who is both the creator and primary admin.

## Core Value

Clinicians and healthcare IT professionals have a trusted place to both read real frontline perspectives AND have meaningful discussions with each other.

## Requirements

### Validated

- ✓ Static marketing/landing page design — existing (index.html reference)
- ✓ Domain and hosting infrastructure — existing (clinicaltocode.com on Vercel)

### Active

**Content**
- [ ] Articles published and managed via headless CMS (Sanity) with editor UI
- [ ] Article pages with category, author, read time, tags
- [ ] Featured/hero article on homepage

**Community**
- [ ] Reddit-style forum with topics/categories, threads, upvotes, nested replies
- [ ] Users can create threads and reply to discussions
- [ ] Forum organized by clinical topic (Nursing, EHR, Informatics, etc.)

**Auth**
- [ ] User signup with email and password
- [ ] Email verification on signup
- [ ] User login with persistent session
- [ ] Password reset via email

**Monetization**
- [ ] Google AdSense placements on articles and homepage
- [ ] Newsletter signup (integrated with email provider)
- [ ] Paid membership tier (premium content or forum access)
- [ ] Sponsorship/partner placement slots

**Infrastructure**
- [ ] Reliable database with connection pooling (no disconnects)
- [ ] Production-ready deployment on Vercel

### Out of Scope

- Social login (OAuth) — email/password sufficient for v1
- Mobile app — web-first
- Real-time chat — Reddit-style async forum is sufficient
- Multi-author CMS with contributor workflow — solo-managed for now
- Video content — text-first

## Context

- The live site (clinicaltocode.com) was built with v0.app (Vercel AI prototyping tool) and has database connection issues and unreliable community features — likely due to lack of connection pooling in the serverless Postgres setup
- This repo was a previous manual rebuild attempt that was abandoned — the `index.html` file serves as a solid visual design reference
- The codebase map in `.planning/codebase/` documents the current broken state

## Constraints

- **Solo operator**: Content management and moderation must be manageable by one person
- **Tech**: Next.js 15 (App Router) + TypeScript + Tailwind CSS — rebuild from this base
- **Database**: Must use connection pooling to avoid the v0 disconnection issues
- **CMS**: Must have a non-developer editor UI (Sanity) — no markdown-in-repo workflow
- **Timeline**: No hard deadline — quality over speed

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full rebuild vs fix v0 | v0-generated code is hard to maintain and had structural DB issues | — Pending |
| Sanity as CMS | Editor UI, free tier, excellent Next.js integration, no deploy-to-publish | — Pending |
| Supabase for DB | Managed Postgres with built-in connection pooling (PgBouncer), auth helpers, realtime | — Pending |
| Reddit-style forum over Discord/chat | Async, searchable, SEO-friendly, suits the healthcare professional audience | — Pending |
| Email/password auth only for v1 | Simpler, sufficient, avoids OAuth complexity | — Pending |

---
*Last updated: 2026-03-15 after initialization*
