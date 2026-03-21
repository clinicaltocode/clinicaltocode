---
phase: 04-forum
plan: "02"
subsystem: forum-data-layer
tags: [forum, typescript, supabase, drizzle, server-actions, queries]
dependency_graph:
  requires: [04-01]
  provides: [lib/forum/types.ts, lib/forum/utils.ts, lib/forum/queries.ts, lib/forum/actions.ts, lib/supabase/schema.ts]
  affects: [04-03, 04-04, 04-05, 04-06]
tech_stack:
  added: [drizzle-orm/pg-core, date-fns (formatDistanceToNow)]
  patterns:
    - Server Actions with 'use server' directive
    - Three-query pattern for thread+posts (no recursive CTE)
    - Session client (createClient) for all forum writes — never supabaseAdmin
    - Server-side slug derivation with timestamp suffix for collision resistance
key_files:
  created:
    - lib/forum/types.ts
    - lib/forum/utils.ts
    - lib/forum/queries.ts
    - lib/forum/actions.ts
  modified:
    - lib/supabase/schema.ts
    - tests/forum/forum.test.ts
decisions:
  - "slugify converts non-word chars to spaces before collapsing to hyphens — correctly handles / in input (e.g. 'leading/trailing' → 'leading-trailing')"
  - "createThread resolves category slug via pre-fetch rather than joining on insert response — avoids Supabase typed array join issue"
  - "reply_count incremented with read-then-write (race acceptable) — no DB trigger required"
metrics:
  duration: "107 minutes"
  completed_date: "2026-03-21"
  tasks_completed: 2
  files_created: 4
  files_modified: 2
---

# Phase 4 Plan 02: Forum Data Layer Summary

**One-liner:** TypeScript interfaces, slugify utility, four Supabase read queries, and four Server Actions for forum write operations — complete data layer for all forum UI plans.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Types, utilities, and Drizzle schema | 43d8152 | lib/forum/types.ts, lib/forum/utils.ts, lib/supabase/schema.ts, tests/forum/forum.test.ts |
| 2 | Read queries and Server Actions | f0c31cc | lib/forum/queries.ts, lib/forum/actions.ts |

## What Was Built

### lib/forum/types.ts
Five TypeScript interfaces exported: `ForumCategory`, `ForumThread`, `ForumPost`, `ForumBookmark`, `ThreadWithPosts`. All interfaces use snake_case field names matching Supabase column names exactly. Joined fields are typed as optional (`forum_categories?`, `user_profiles?`, `forum_threads?`).

### lib/forum/utils.ts
- `slugify(text)` — converts title to URL-safe kebab-case slug, capped at 80 chars. Non-word characters are replaced with a space before collapsing runs of whitespace/hyphens to a single hyphen. Unit tested.
- `formatRelativeTime(date)` — wraps `date-fns` `formatDistanceToNow` with `addSuffix: true`.

### lib/supabase/schema.ts
Replaced `export {}` placeholder with full Drizzle table definitions for `forum_categories`, `forum_threads`, `forum_posts`, `forum_votes`, `forum_bookmarks`. Uses `drizzle-orm/pg-core` primitives; camelCase Drizzle property names map to snake_case column names.

### lib/forum/queries.ts
Four public read functions — all use `createClient()` (session client), never `supabaseAdmin`:
- `getCategories()` — all categories ordered by title
- `getThreadsByCategory(categorySlug)` — inner join to filter by category, `is_removed=false`, limit 50
- `getThreadWithPosts(threadSlug)` — three-query pattern: thread → top-level posts (`parent_post_id IS NULL`) → nested replies (`parent_post_id IN (topPostIds)`). No recursive CTE.
- `getUserBookmarks()` — requires authenticated session, returns joined thread data

### lib/forum/actions.ts
Four Server Actions (`'use server'`) — all session-client only:
- `createThread(formData)` — validates title (5–200 chars), body (≥20 chars), derives slug server-side (`slugify(title)-${Date.now()}`), sets `author_id` from `getUser()` session. Redirects to `/forum/{categorySlug}/{slug}`.
- `createPost(formData)` — enforces `depth <= 1` at app layer (parent depth check), increments `reply_count` on parent thread.
- `toggleVote(targetId, targetType)` — calls `supabase.rpc('toggle_vote', ...)`. NOT a JS upsert.
- `toggleBookmark(threadId)` — check-then-insert or check-then-delete using UNIQUE constraint semantics.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed slugify special-char handling**
- **Found during:** Task 1 RED→GREEN
- **Issue:** Plan's slugify regex `replace(/[^\w\s-]/g, '')` removed `/` from `'  leading/trailing  '`, then collapsed spaces, producing `'leadingtrailing'` instead of `'leading-trailing'`.
- **Fix:** Changed replacement to `' '` (space) so slashes become separators before the `[\s_-]+` collapse.
- **Files modified:** lib/forum/utils.ts
- **Commit:** 43d8152

**2. [Rule 1 - Bug] Fixed TypeScript error on insert+join response**
- **Found during:** Task 2 tsc check
- **Issue:** `supabase.insert(...).select('slug, forum_categories(slug)').single()` types `forum_categories` as an array; casting to `{ slug: string }` produced TS error TS2352.
- **Fix:** Pre-fetched category slug via a separate `select` before insert. Redirect uses the pre-fetched `category?.slug` and the locally-computed `slug` variable.
- **Files modified:** lib/forum/actions.ts
- **Commit:** f0c31cc

## Verification

- `npx vitest run tests/forum/` — 1 test passing, 32 todo, 2 skipped (schema/vote tests need live DB)
- `npx tsc --noEmit` — clean (0 errors)
- `grep "rpc('toggle_vote'" lib/forum/actions.ts` — match found
- `grep "supabase/service" lib/forum/actions.ts` — no match (supabaseAdmin not imported)

## Self-Check: PASSED

Files exist:
- lib/forum/types.ts — FOUND
- lib/forum/utils.ts — FOUND
- lib/forum/queries.ts — FOUND
- lib/forum/actions.ts — FOUND
- lib/supabase/schema.ts — FOUND (modified)

Commits exist:
- 43d8152 — FOUND (Task 1)
- f0c31cc — FOUND (Task 2)
