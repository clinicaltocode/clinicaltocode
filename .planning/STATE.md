---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
stopped_at: Completed 06-05-PLAN.md
last_updated: "2026-03-21T19:12:00Z"
progress:
  total_phases: 7
  completed_phases: 3
  total_plans: 21
  completed_plans: 17
---

# Project State

## Project Reference
See: .planning/PROJECT.md (updated 2026-03-15)

**Core value:** Clinicians and healthcare IT professionals have a trusted place to both read real frontline perspectives AND have meaningful discussions with each other.
**Current focus:** Phase 6 — Moderation (Phase 5 User Profiles complete)

## Roadmap Status

| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation | ✅ Complete |
| 2 | Auth | ✅ Complete |
| 3 | Content | ✅ Plan 03 Complete (Wave 7 manual verification pending) |
| 4 | Forum | ✅ Complete (all 6 plans, all FORUM requirements verified) |
| 5 | User Profiles | ✅ Complete (all 5 plans, all PROF requirements verified) |
| 6 | Moderation | In Progress — Plan 05 complete |
| 7 | Monetization | Not Started |

## Active Phase
Phase 6 — Moderation (Plan 05 complete — Plan 06 next)

**Last session:** 2026-03-21T19:12:00Z
**Stopped at:** Completed 06-05-PLAN.md

**Artifacts:**
- `.planning/phases/03-content/03-PLAN.md` — 18 tasks, 8 waves (approved)
- `.planning/phases/03-content/03-SUMMARY.md` — execution summary
- `.planning/phases/04-forum/04-01-PLAN.md` — 2 tasks complete
- `.planning/phases/04-forum/04-01-SUMMARY.md` — execution summary
- `.planning/phases/04-forum/04-02-PLAN.md` — 2 tasks complete
- `.planning/phases/04-forum/04-02-SUMMARY.md` — execution summary
- `.planning/phases/04-forum/04-03-PLAN.md` — 1 task complete
- `.planning/phases/04-forum/04-03-SUMMARY.md` — execution summary
- `.planning/phases/04-forum/04-04-PLAN.md` — 2 tasks complete
- `.planning/phases/04-forum/04-04-SUMMARY.md` — execution summary
- `.planning/phases/04-forum/04-05-PLAN.md` — 2 tasks complete
- `.planning/phases/04-forum/04-05-SUMMARY.md` — execution summary
- `.planning/phases/04-forum/04-06-PLAN.md` — 3 tasks complete (incl. human-verify approved)
- `.planning/phases/04-forum/04-06-SUMMARY.md` — execution summary
- `.planning/phases/05-user-profiles/05-01-PLAN.md` — 3 tasks complete
- `.planning/phases/05-user-profiles/05-01-SUMMARY.md` — execution summary
- `.planning/phases/05-user-profiles/05-02-PLAN.md` — 2 tasks complete
- `.planning/phases/05-user-profiles/05-02-SUMMARY.md` — execution summary
- `.planning/phases/05-user-profiles/05-03-PLAN.md` — 2 tasks complete
- `.planning/phases/05-user-profiles/05-03-SUMMARY.md` — execution summary
- `.planning/phases/05-user-profiles/05-04-PLAN.md` — 2 tasks complete
- `.planning/phases/05-user-profiles/05-04-SUMMARY.md` — execution summary
- `.planning/phases/05-user-profiles/05-05-PLAN.md` — 3 tasks complete (incl. human-verify approved)
- `.planning/phases/05-user-profiles/05-05-SUMMARY.md` — execution summary
- `.planning/phases/06-moderation/06-01-PLAN.md` — 3 tasks complete
- `.planning/phases/06-moderation/06-01-SUMMARY.md` — execution summary
- `.planning/phases/06-moderation/06-02-PLAN.md` — 2 tasks complete
- `.planning/phases/06-moderation/06-02-SUMMARY.md` — execution summary
- `.planning/phases/06-moderation/06-03-PLAN.md` — 2 tasks complete
- `.planning/phases/06-moderation/06-03-SUMMARY.md` — execution summary
- `.planning/phases/06-moderation/06-04-PLAN.md` — 1 task complete
- `.planning/phases/06-moderation/06-04-SUMMARY.md` — execution summary
- `.planning/phases/06-moderation/06-05-PLAN.md` — 2 tasks complete
- `.planning/phases/06-moderation/06-05-SUMMARY.md` — execution summary

## Decisions Log

- Phase 3: webpack client-only React alias for @sanity/vision useEffectEvent compatibility with Next.js 15 internal React bundle
- Phase 3: SSG (generateStaticParams) for article detail pages, revalidated via revalidateTag on webhook publish
- Phase 3: supabaseAdmin service client server-only pattern — never imported in client components
- Phase 3: GROQ query constants file (lib/sanity/queries.ts) with enforced rules as comments
- Phase 3: forum_threads.article_sanity_id stores Sanity _id (immutable) not slug for idempotent webhook inserts
- Phase 4 (04-01): Polymorphic forum_votes table uses target_type TEXT discriminator ('thread' | 'post') rather than separate vote tables
- Phase 4 (04-01): toggle_vote is SECURITY DEFINER to allow atomic multi-table operation bypassing RLS mid-transaction
- Phase 4 (04-01): depth CHECK (depth <= 1) enforced at DB level on forum_posts — hard guarantee for 2-level nesting
- Phase 4 (04-02): slugify treats non-word chars as spaces (not removed) so forward-slash becomes a hyphen separator
- Phase 4 (04-02): createThread pre-fetches category slug before insert to avoid Supabase typed join array issue
- Phase 4 (04-03): /forum/bookmarks added to auth gate only (not verified-user gate) — bookmarks require login but not email verification
- Phase 4 (04-04): buttonVariants with Link instead of Button asChild — Base UI button has no asChild support (unlike shadcn)
- Phase 4 (04-06): initialBookmarked={false} simplification on thread detail — toggle still works since DB is source of truth; Phase 5 can refine initial state
- Phase 4 (04-06): getUserBookmarks updated to join forum_categories(slug) instead of returning category_id UUID — enables correct /forum/[categorySlug]/[threadSlug] URLs on bookmarks page
- Phase 4 (04-06): ForumBookmarkThread interface extracted from ForumBookmark to accommodate nested forum_categories join shape
- Phase 5 (05-01): PROF test stubs use pure function inline definitions (no lib/ imports) — data layer does not exist until Plan 02
- Phase 5 (05-01): avatars bucket created as public=true — avatar URLs work in img tags without signed URLs
- Phase 5 (05-01): Username auto-generation: LOWER(REGEXP_REPLACE(email_prefix + '_' + uuid_6chars)) in both backfill UPDATE and trigger
- Phase 5 (05-02): PGRST116 null guard in getProfile returns null for missing profiles without throwing
- Phase 5 (05-02): VALID_CREDENTIALS exported from types.ts as single source of truth for both Server Action allowlist and UI components
- Phase 5 (05-02): getProfilePostHistory uses parallel Promise.all + JS merge — PostgREST has no UNION support
- Phase 5 (05-03): Base UI Button has no asChild — use buttonVariants on label for file input trigger (same as Phase 4-04 pattern)
- Phase 5 (05-03): Base UI SelectRoot onValueChange is (value: string | null) — bridge via null-guard wrapper in CredentialSelect
- Phase 5 (05-03): CredentialBadge has no 'use client' — pure display component safe for server rendering
- Phase 5 (05-04): Inline 'Profile updated.' success feedback uses <p> not a toast — plan specified no additional toast dependency needed
- Phase 5 (05-04): Settings page fetches profile by user.id directly via Supabase query — settings context always has auth user, avoids extra username lookup
- Phase 5 (05-04): shadcn Textarea installed as auto-fix — UI-SPEC listed it as existing but not yet installed in components/ui/
- Phase 5 (05-05): AuthorMeta interface co-located in lib/forum/types.ts (forum display type) rather than lib/profile/types.ts
- Phase 5 (05-05): author prop optional on ThreadCard and PostItem for backward compatibility with existing call sites
- Phase 5 (05-05): Batch profile fetch pattern — deduplicate author_ids with Set, single getProfilesByIds call, profilesById[id] ?? null per render
- Phase 6 (06-01): Admin middleware guard uses two-block structure — unauthenticated fast path (no DB) precedes is_admin DB check (only fires for /admin/* paths)
- Phase 6 (06-01): content_reports duplicate handling — error code 23505 treated as success in submitReport, matching the no-op intent of the unique constraint
- Phase 6 (06-01): Admin reads content_reports via explicit RLS SELECT policy (not service client) — cleaner than blanket RLS bypass for read operations
- Phase 6 (06-02): requireAdmin() throws new Error('Unauthorized') — not redirect() — so admin actions fail loudly if called without proper route context
- Phase 6 (06-02): restoreContent and permanentDeleteContent included per plan spec (MOD-03d/e) — seven actions total, not five
- Phase 6 (06-03): Base UI Dialog uses named export { Dialog } from '@base-ui/react/dialog' — NOT namespace import (* as Dialog) — the module exports Dialog as a single named export wrapping Root/Backdrop/Popup
- Phase 6 (06-03): GuidelinesBanner uses DISMISSED_KEY constant for localStorage key — SSR-safe mount-check pattern with useState(true) default + useEffect
- Phase 6 (06-04): Static hardcoded JSX for community guidelines — no CMS dependency, founder edits source directly; page works even if DB is down
- Phase 6 (06-05): ThreadCard required 'use client' directive — ReportButton is a client component, auto-fix applied
- Phase 6 (06-05): is_removed guard on thread detail page uses intermediate threadCheck variable — avoids destructuring before null check

## Notes

**Wave 7 manual steps still required:**
1. Apply migration: supabase/migrations/20260316000000_add_forum_tables.sql via Supabase SQL Editor
2. Create Sanity content (Category, Author, Article) in Studio at http://localhost:3000/studio
3. Configure Sanity webhook at sanity.io/manage with SANITY_WEBHOOK_SECRET from .env.local
4. Update forum_categories.sanity_category_id values to match actual Sanity document _ids
5. Apply migration: supabase/migrations/20260322000000_add_profile_storage.sql via Supabase SQL Editor (Phase 5 — avatars bucket + username backfill)
6. Apply migration: supabase/migrations/20260322000001_add_moderation.sql via Supabase SQL Editor (Phase 6 — content_reports table + admin update policies)
7. Set is_admin = true on own user_profiles row via Supabase SQL Editor (solo operator pattern)
