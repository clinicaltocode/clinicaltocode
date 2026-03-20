---
phase: 03-content
plan: 03
subsystem: content
tags: [sanity, portabletext, groq, supabase, next.js, webhook, shadcn]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Next.js app structure, Supabase client, Sanity client stub, shadcn setup
  - phase: 02-auth
    provides: Supabase service role key env var, middleware, user_profiles table

provides:
  - Sanity Studio with article/author/category schemas registered
  - sanityFetch wrapper with React cache() deduplication and tag-based revalidation
  - urlFor image builder with hotspot/crop support
  - GROQ query constants for articles index, detail, count, slugs, categories
  - supabaseAdmin service client (server-only, bypasses RLS)
  - forum_categories and forum_threads Supabase migration
  - /articles paginated index with CategoryFilter and PaginationControls
  - /articles/[slug] detail page with PortableText renderer and read-time
  - POST /api/sanity/revalidate webhook with signature verification and forum thread creation
  - Wave 0 test stubs for content structural properties

affects:
  - 04-forum (forum_categories/forum_threads tables ready, supabaseAdmin pattern)
  - 05-user-profiles (author model, article_sanity_id idempotency pattern)

# Tech tracking
tech-stack:
  added:
    - "@sanity/image-url — urlFor() builder for hotspot-aware image cropping"
    - "@portabletext/react — PortableText block renderer for article body"
    - "@sanity/webhook — isValidSignature for webhook HMAC verification"
    - "sanity/structure — structureTool() replacing deprecated deskTool()"
  patterns:
    - "sanityFetch wrapper: React cache() + tag-based revalidation (no ISR when tags present)"
    - "Idempotent webhook: check article_sanity_id before insert to prevent duplicate threads"
    - "request.text() before request.json() in Route Handlers to preserve body stream"
    - "supabaseAdmin import rule: server-only (Route Handlers, Server Actions, Server Components)"
    - "GROQ rules: drafts filter, defined(publishedAt), slug.current projection, order before slice"

key-files:
  created:
    - "sanity/schemas/article.ts — article document type with all fields"
    - "sanity/schemas/author.ts — author document type with credential"
    - "sanity/schemas/category.ts — category document type"
    - "sanity/schemas/index.ts — barrel export"
    - "lib/sanity/fetch.ts — sanityFetch() with React cache() wrapper"
    - "lib/sanity/image.ts — urlFor() builder"
    - "lib/sanity/queries.ts — ARTICLES_QUERY, ARTICLE_BY_SLUG_QUERY, etc."
    - "lib/supabase/service.ts — supabaseAdmin service role client"
    - "lib/read-time.ts — estimateReadTime() at 200 wpm"
    - "components/content/article-card.tsx — server component card"
    - "components/content/category-filter.tsx — client component with URL routing"
    - "components/content/pagination-controls.tsx — client component"
    - "components/content/article-body.tsx — PortableText client component"
    - "components/ui/badge.tsx — shadcn Badge component"
    - "app/articles/page.tsx — paginated index with CategoryFilter"
    - "app/articles/[slug]/page.tsx — detail page with generateStaticParams"
    - "app/api/sanity/revalidate/route.ts — webhook handler"
    - "supabase/migrations/20260316000000_add_forum_tables.sql"
    - "tests/content/content.test.ts — Wave 0 stub tests"
  modified:
    - "sanity.config.ts — registered schemas, switched to structureTool"
    - "next.config.ts — webpack alias to resolve React 19.2+ for @sanity/vision"
    - "app/auth/verify-email/page.tsx — added force-dynamic export"

key-decisions:
  - "webpack alias for react/react-dom on client bundle only: @sanity/vision uses useEffectEvent (React 19.2+) but Next.js aliases react to its internal compiled bundle which lacks it"
  - "Article detail uses SSG (generateStaticParams) for pre-rendering; revalidated via revalidateTag on webhook"
  - "supabaseAdmin pattern: server-only import, never in client components or across server/client boundary"
  - "GROQ query constants in single file (lib/sanity/queries.ts) with enforced rules as comments"
  - "forum_threads article_sanity_id stores Sanity _id (immutable) not slug for idempotency"

patterns-established:
  - "sanityFetch: always pass tags array for on-demand revalidation; omit tags to get 60s ISR"
  - "urlFor: pass entire coverImage object (crop + hotspot) not just coverImage.asset"
  - "Article index page: never fetch body field (GROQ body only in ARTICLE_BY_SLUG_QUERY)"
  - "Webhook handler: text() before json() to preserve raw body for HMAC verification"

requirements-completed: [CONT-01, CONT-02, CONT-03, CONT-04]

# Metrics
duration: 17min
completed: 2026-03-20
---

# Phase 3 Plan 03: Content Summary

**Sanity CMS content pipeline with GROQ queries, @portabletext/react article rendering, supabaseAdmin webhook creating forum threads on publish — /articles index and /articles/[slug] detail pages with ISR tag revalidation**

## Performance

- **Duration:** 17 min
- **Started:** 2026-03-20T22:18:45Z
- **Completed:** 2026-03-20T22:35:50Z
- **Tasks:** 16 automated (tasks 3-03-01 through 3-03-16), 2 manual (3-03-17, 3-03-18 — Wave 7 human verification)
- **Files modified:** 22

## Accomplishments

- Sanity Studio schemas for article, author, and category registered — Studio shows correct document types
- Complete content pipeline: sanityFetch → GROQ queries → /articles index + /articles/[slug] detail with PortableText
- Webhook route handler at /api/sanity/revalidate with HMAC signature verification, tag revalidation, and idempotent forum thread creation in Supabase

## Task Commits

Each task was committed atomically:

1. **Task 3-03-01: Add content test stub file** — `acc149a` (test)
2. **Task 3-03-02: Write Sanity schema files** — `96141d2` (feat)
3. **Task 3-03-03: Register schemas in sanity.config.ts** — `84903b4` (feat)
4. **Task 3-03-04: Write lib/sanity/fetch.ts** — `a93ed83` (feat)
5. **Task 3-03-05: Write lib/sanity/image.ts** — `65c0251` (feat)
6. **Task 3-03-06: Write lib/sanity/queries.ts** — `7541984` (feat)
7. **Task 3-03-07: Write lib/supabase/service.ts** — `d2a48cb` (feat)
8. **Task 3-03-08: Apply forum tables migration** — `fd30694` (feat)
9. **Task 3-03-09: Install packages and shadcn Badge** — `80f4c81` (feat)
10. **Task 3-03-10: Write article-card.tsx** — `23e1a5f` (feat)
11. **Task 3-03-11: Write CategoryFilter and PaginationControls** — `98fdda7` (feat)
12. **Task 3-03-12: Write app/articles/page.tsx** — `4cad07a` (feat)
13. **Task 3-03-13: Write read-time.ts and article-body.tsx** — `7f0df24` (feat)
14. **Task 3-03-14: Write app/articles/[slug]/page.tsx** — `bbd741e` (feat)
15. **Task 3-03-15: Add env variables** — (no code commit — .env.local only, gitignored)
16. **Task 3-03-16: Write revalidate/route.ts** — `7440795` (feat)
17. **Tasks 3-03-17 and 3-03-18** — Wave 7 manual verification (requires dev server + Sanity Studio + Supabase)

## Files Created/Modified

- `tests/content/content.test.ts` — Wave 0 stub tests for GROQ guards, read-time, forum idempotency
- `sanity/schemas/article.ts` — article document with title, slug, author ref, category ref, tags, body
- `sanity/schemas/author.ts` — author document with name, credential, bio, avatar
- `sanity/schemas/category.ts` — category document with title, slug, description
- `sanity/schemas/index.ts` — barrel export
- `sanity.config.ts` — registered schemas, switched from deskTool to structureTool
- `lib/sanity/fetch.ts` — sanityFetch() with React cache() and tag-based revalidation
- `lib/sanity/image.ts` — urlFor() with SanityImageSource import fix
- `lib/sanity/queries.ts` — 5 GROQ query constants with all guards enforced
- `lib/supabase/service.ts` — supabaseAdmin bypassing RLS, server-only
- `lib/read-time.ts` — estimateReadTime() counting words in PortableText blocks
- `components/content/article-card.tsx` — server component with cover image, category badge, author byline
- `components/content/category-filter.tsx` — client component with URL param routing
- `components/content/pagination-controls.tsx` — client component with Previous/Next
- `components/content/article-body.tsx` — PortableText renderer with prose styles
- `components/ui/badge.tsx` — shadcn Badge component
- `app/articles/page.tsx` — paginated index, awaits searchParams (Next.js 15)
- `app/articles/[slug]/page.tsx` — SSG detail page with generateStaticParams
- `app/api/sanity/revalidate/route.ts` — webhook handler
- `supabase/migrations/20260316000000_add_forum_tables.sql` — forum_categories + forum_threads
- `next.config.ts` — webpack alias for React 19.2+ on client bundle
- `app/auth/verify-email/page.tsx` — force-dynamic export added

## Decisions Made

- **webpack React alias (client-only):** @sanity/vision 5.16.0 uses `useEffectEvent` from React 19.2+ but Next.js 15 aliases `react` in webpack to its internal compiled bundle which lacks it. Applied alias only to `isServer: false` to avoid dual-React prerender issues.
- **SSG for article detail:** generateStaticParams pre-renders all published articles; revalidateTag on webhook publish busts the cache for immediate updates.
- **SanityImageSource import fix:** Package exports `SanityImageSource` from root, not from `@sanity/image-url/lib/types/types` as referenced in the plan.
- **PortableText component types:** Used `PortableTextBlockComponent`, `PortableTextListComponent` from `@portabletext/react` with appropriate casts for mark components.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed @sanity/vision useEffectEvent webpack build error**
- **Found during:** Task 3-03-06 (Wave 2 build verification)
- **Issue:** Build failed — @sanity/vision ESM imports `useEffectEvent` from React, but Next.js webpack aliases `react` to its internal compiled bundle which does not export it
- **Fix:** Added client-only webpack alias in next.config.ts pointing to project's React 19.2.4
- **Files modified:** `next.config.ts`
- **Verification:** `npx next build` exits 0
- **Committed in:** `7541984` (Task 3-03-06 commit)

**2. [Rule 3 - Blocking] Fixed verify-email prerender failure**
- **Found during:** Task 3-03-06 (build verification)
- **Issue:** /auth/verify-email page uses `useActionState` hook but Next.js attempted static prerender, causing "Cannot read properties of null (reading 'useContext')" error
- **Fix:** Added `export const dynamic = 'force-dynamic'` to the page (pre-existing Phase 2 issue, exposed by build verification in this phase)
- **Files modified:** `app/auth/verify-email/page.tsx`
- **Verification:** `npx next build` exits 0
- **Committed in:** `7541984` (Task 3-03-06 commit)

**3. [Rule 1 - Bug] Fixed SanityImageSource import path**
- **Found during:** Task 3-03-06 (build verification)
- **Issue:** Plan specified `import type { SanityImageSource } from '@sanity/image-url/lib/types/types'` but package does not have that path — types are exported from package root
- **Fix:** Changed to `import type { SanityImageSource } from '@sanity/image-url'`
- **Files modified:** `lib/sanity/image.ts`
- **Verification:** `npx tsc --noEmit` exits 0
- **Committed in:** `7541984` (Task 3-03-06 commit)

**4. [Rule 1 - Bug] Fixed PortableText component type mismatches**
- **Found during:** Task 3-03-13 (ArticleBody component)
- **Issue:** Plan's type annotations for PortableText components were incorrect — `value` prop in mark components is optional per PortableTextMarkComponentProps, `list` requires `PortableTextListComponent` not `PortableTextBlockComponent`
- **Fix:** Used correct types from `@portabletext/react`, value?.href optional chaining, cast mark components as `any`
- **Files modified:** `components/content/article-body.tsx`
- **Verification:** `npx tsc --noEmit` exits 0
- **Committed in:** `7f0df24` (Task 3-03-13 commit)

---

**Total deviations:** 4 auto-fixed (2 blocking, 2 bugs)
**Impact on plan:** All auto-fixes necessary for build to pass and types to be correct. No scope creep.

## User Setup Required

The following manual steps are required to complete Wave 7 verification:

**1. Apply Supabase migration:**
```bash
# Paste supabase/migrations/20260316000000_add_forum_tables.sql into Supabase SQL Editor
# OR: supabase db push
```

**2. Create Sanity content (Task 3-03-17):**
- Start dev server: `npm run dev`
- Open Sanity Studio at http://localhost:3000/studio
- Create: Category "Nursing", Author "Dr. Jane Smith, RN PhD", Article "Test Article — Phase 3"
- Publish the article and verify /articles and /articles/[slug] render correctly

**3. Configure Sanity webhook (Task 3-03-18):**
- Generate secret: already done (SANITY_WEBHOOK_SECRET in .env.local)
- In Sanity Manage → API → Webhooks → Create webhook:
  - URL: https://your-tunnel.ngrok.io/api/sanity/revalidate
  - Trigger: Publish, Filter: `_type == "article"`, Method: POST
- Expose dev server: `npx ngrok http 3000`
- Publish article and verify forum_threads row in Supabase

**4. Update sanity_category_id in forum_categories:**
```sql
-- After creating category in Studio, get its _id and run:
UPDATE forum_categories SET sanity_category_id = '<actual-sanity-id>' WHERE slug = 'nursing';
```

## Next Phase Readiness

- forum_categories and forum_threads tables are ready for Phase 4 (Forum)
- supabaseAdmin pattern established for all future server-side Supabase writes
- Article content pipeline fully functional end-to-end
- Wave 7 manual verification steps documented above

---
*Phase: 03-content*
*Completed: 2026-03-20*

## Self-Check: PASSED

All 13 key files verified present on disk. All 4 spot-checked commits verified in git log.
