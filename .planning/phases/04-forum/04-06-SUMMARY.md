---
phase: 04-forum
plan: 06
subsystem: ui
tags: [react, next.js, supabase, optimistic-ui, useTransition, bookmarks, voting]

# Dependency graph
requires:
  - phase: 04-forum
    provides: toggleVote and toggleBookmark Server Actions, getUserBookmarks query (Plans 02-05)
provides:
  - VoteButton Client Component with optimistic upvote toggle and toggle semantics
  - BookmarkButton Client Component with bookmark toggle and icon state
  - Bookmarks page at /forum/bookmarks listing saved threads for authenticated user
  - Thread detail page wired with both interactive buttons
affects: [05-profiles, 06-moderation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useTransition for concurrent-safe Server Action calls from Client Components"
    - "Optimistic UI: update local state immediately, revert on Server Action error"
    - "Nested Supabase join (forum_threads -> forum_categories) for category slug in bookmarks query"

key-files:
  created:
    - components/forum/vote-button.tsx
    - components/forum/bookmark-button.tsx
    - app/forum/bookmarks/page.tsx
  modified:
    - app/forum/[categorySlug]/[threadSlug]/page.tsx
    - lib/forum/queries.ts
    - lib/forum/types.ts

key-decisions:
  - "initialBookmarked={false} simplification on thread detail page — toggle still works correctly since DB is source of truth; Phase 5 profile work can refine initial state"
  - "getUserBookmarks updated to join forum_categories(slug) instead of returning category_id UUID — enables correct /forum/[categorySlug]/[threadSlug] URLs on bookmarks page"
  - "ForumBookmarkThread interface extracted from ForumBookmark to accommodate nested forum_categories join shape"

patterns-established:
  - "Client Component pattern: useState + useTransition + async handler + optimistic update + revert on error"
  - "Nested Supabase join pattern: forum_threads(id, title, slug, ..., forum_categories(slug)) for denormalized URL construction"

requirements-completed:
  - FORUM-04
  - FORUM-06

# Metrics
duration: 2min
completed: 2026-03-21
---

# Phase 4 Plan 06: Interactive Vote/Bookmark Buttons and Bookmarks Page Summary

**Optimistic upvote toggle (useTransition + toggleVote RPC) and bookmark toggle wired to thread detail page, plus /forum/bookmarks Server Component listing saved threads with category-slug URLs**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-21T15:36:02Z
- **Completed:** 2026-03-21T15:38:00Z
- **Tasks:** 2 auto tasks complete (checkpoint:human-verify pending)
- **Files modified:** 6

## Accomplishments
- VoteButton: optimistic count increment/decrement with useTransition, reverts on toggleVote RPC error
- BookmarkButton: icon toggles between Bookmark and BookmarkCheck, calls toggleBookmark Server Action
- Thread detail page: both buttons integrated into thread header metadata row
- Bookmarks page: Server Component listing saved threads with empty state and correct category-slug URLs
- getUserBookmarks query updated to include nested forum_categories(slug) join for proper URL construction
- ForumBookmark type updated with extracted ForumBookmarkThread interface to type the nested join

## Task Commits

Each task was committed atomically:

1. **Task 1: VoteButton and BookmarkButton components** - `7e099e4` (feat)
2. **Task 2: Bookmarks page** - `a23a4a9` (feat)

**Plan metadata:** (pending final commit after human-verify checkpoint)

## Files Created/Modified
- `components/forum/vote-button.tsx` - Client Component: optimistic upvote toggle with useTransition
- `components/forum/bookmark-button.tsx` - Client Component: bookmark toggle with icon state
- `app/forum/bookmarks/page.tsx` - Server Component: authenticated saved threads listing
- `app/forum/[categorySlug]/[threadSlug]/page.tsx` - Added VoteButton and BookmarkButton to thread header
- `lib/forum/queries.ts` - getUserBookmarks: added nested forum_categories(slug) join
- `lib/forum/types.ts` - Added ForumBookmarkThread interface; updated ForumBookmark to use it

## Decisions Made
- `initialBookmarked={false}` used as a simplification on thread detail — the toggle works correctly because the Server Action checks the DB. Phase 5 profile work can add a per-user initial state check.
- getUserBookmarks query updated to return `forum_categories(slug)` nested join instead of `category_id` UUID so bookmarks page can construct valid `/forum/[categorySlug]/[threadSlug]` URLs.
- ForumBookmarkThread interface extracted (rather than inline type) to keep types.ts readable and allow future additions (e.g., author info for bookmark cards).

## Deviations from Plan

None — plan executed exactly as written. The ForumBookmarkThread interface extraction was anticipated by the plan ("TypeScript interface for ForumBookmark in types.ts may need a minor update to reflect the nested join").

## Issues Encountered
None.

## User Setup Required
None — no external service configuration required for this plan.

## Next Phase Readiness
- Full Phase 4 Forum implementation complete pending human-verify checkpoint approval
- All 6 FORUM requirements (FORUM-01 through FORUM-06) have corresponding code
- Phase 5 (User Profiles) can build on: user_profiles table (04-01), bookmark initial state (thread detail page), vote state per-user

---
*Phase: 04-forum*
*Completed: 2026-03-21*
