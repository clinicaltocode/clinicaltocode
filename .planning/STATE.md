# Project State

## Project Reference
See: .planning/PROJECT.md (updated 2026-03-15)

**Core value:** Clinicians and healthcare IT professionals have a trusted place to both read real frontline perspectives AND have meaningful discussions with each other.
**Current focus:** Phase 3 — Content (Plan 03 complete)

## Roadmap Status

| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation | ✅ Complete |
| 2 | Auth | ✅ Complete |
| 3 | Content | ✅ Plan 03 Complete (Wave 7 manual verification pending) |
| 4 | Forum | Not Started |
| 5 | User Profiles | Not Started |
| 6 | Moderation | Not Started |
| 7 | Monetization | Not Started |

## Active Phase
Phase 3 — Content (Plan 03 complete — Wave 7 manual verification pending)

**Last session:** 2026-03-20
**Stopped at:** Completed 03-content-03-PLAN.md (tasks 3-03-01 through 3-03-16 automated; 3-03-17 and 3-03-18 require manual Studio + Supabase verification)

**Artifacts:**
- `.planning/phases/03-content/03-PLAN.md` — 18 tasks, 8 waves (approved)
- `.planning/phases/03-content/03-SUMMARY.md` — execution summary

## Decisions Log

- Phase 3: webpack client-only React alias for @sanity/vision useEffectEvent compatibility with Next.js 15 internal React bundle
- Phase 3: SSG (generateStaticParams) for article detail pages, revalidated via revalidateTag on webhook publish
- Phase 3: supabaseAdmin service client server-only pattern — never imported in client components
- Phase 3: GROQ query constants file (lib/sanity/queries.ts) with enforced rules as comments
- Phase 3: forum_threads.article_sanity_id stores Sanity _id (immutable) not slug for idempotent webhook inserts

## Notes

**Wave 7 manual steps still required:**
1. Apply migration: supabase/migrations/20260316000000_add_forum_tables.sql via Supabase SQL Editor
2. Create Sanity content (Category, Author, Article) in Studio at http://localhost:3000/studio
3. Configure Sanity webhook at sanity.io/manage with SANITY_WEBHOOK_SECRET from .env.local
4. Update forum_categories.sanity_category_id values to match actual Sanity document _ids
