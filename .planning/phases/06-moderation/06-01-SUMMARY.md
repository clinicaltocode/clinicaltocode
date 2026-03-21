---
phase: "06"
plan: "01"
subsystem: moderation
tags: [testing, database, middleware, wave-0]
dependency_graph:
  requires:
    - "05-01: user_profiles table with is_admin, is_banned columns"
    - "04-01: forum_posts and forum_threads tables with is_removed column"
  provides:
    - "moderation.test.ts: Wave 0 test contract for MOD-01 through MOD-03"
    - "content_reports table schema (pending manual application)"
    - "admin route guard in middleware.ts"
  affects:
    - "middleware.ts: all /admin/* requests now checked"
    - "future lib/moderation/actions.ts: test stubs define expected behavior"
tech_stack:
  added: []
  patterns:
    - "Wave 0 stub pattern: pure inline helper functions + it.todo for data-layer tests"
    - "Middleware two-block admin guard: unauthenticated fast path + is_admin DB check"
    - "RLS admin policy pattern: EXISTS subquery on user_profiles.is_admin"
key_files:
  created:
    - tests/forum/moderation.test.ts
    - supabase/migrations/20260322000001_add_moderation.sql
  modified:
    - middleware.ts
decisions:
  - "Admin middleware guard uses two-block structure: Block A (no DB, fast path for unauthenticated) precedes Block B (DB query only when user exists and pathname is /admin/*)"
  - "content_reports duplicate handling: error code 23505 treated as success in submitReport, matching the no-op intent of the unique constraint"
  - "Admin reads content_reports via explicit RLS SELECT policy (not service client) — cleaner than blanket RLS bypass for read operations"
metrics:
  duration_seconds: 81
  completed_date: "2026-03-21"
  tasks_completed: 3
  files_created: 2
  files_modified: 1
---

# Phase 6 Plan 01: Moderation Wave 0 — Test Stubs, Migration, Middleware Summary

Wave 0 scaffolding: moderation test contract (11 live + 8 todo), content_reports migration with unique constraint and RLS, and two-block admin route guard in middleware.

## What Was Built

### Task 1: Wave 0 Test Stubs (`tests/forum/moderation.test.ts`)

Created test stubs covering MOD-01, MOD-02, and MOD-03 using the same inline pure-function pattern established in `tests/profile/profile.test.ts`.

- **MOD-01**: `isValidReportReason` allowlist (5 valid reasons) + `handleSubmitReportError` covering 23505 duplicate suppression — 5 live tests, 2 todos
- **MOD-02**: `isValidStatusTransition` for pending→reviewed and idempotent reviewed→reviewed — 2 live tests, 2 todos
- **MOD-03**: `getPostDisplay` placeholder rendering, `canUserPost` ban check, `shouldShowPlaceholder` — 4 live tests, 4 todos

All 11 live tests pass (`npx vitest run tests/forum/moderation.test.ts` exits 0). The 8 `it.todo` stubs define the data-layer contract for Plans 02–04.

### Task 2: DB Migration (`supabase/migrations/20260322000001_add_moderation.sql`)

Created the `content_reports` table with:
- UUID PK, reporter_id FK to auth.users (CASCADE delete)
- target_type CHECK ('thread' | 'post'), reason CHECK (5 values), status CHECK ('pending' | 'reviewed')
- UNIQUE (reporter_id, target_type, target_id) — enforces one-report-per-user at DB level
- RLS: INSERT (own row), SELECT (own reports + admins), UPDATE (admins)
- Admin UPDATE policies on forum_posts, forum_threads, and user_profiles — enables soft-delete and ban/unban without SECURITY DEFINER

Migration is version-controlled only; manual application via Supabase SQL Editor (same Wave 7 pattern as prior phases).

### Task 3: Middleware Admin Guard (`middleware.ts`)

Added two guard blocks after the unverified-user guard, before the already-authenticated redirect:

- **Block A** (fast path): `!user && pathname.startsWith('/admin')` → redirect to `/auth/login` with no DB query
- **Block B** (is_admin check): `user && pathname.startsWith('/admin')` → query `user_profiles.is_admin`; redirect to `/` if false

DB query is gated behind the pathname check, so public routes incur zero overhead. `npx tsc --noEmit` exits 0. All existing guards and the `supabaseResponse` return are unchanged.

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

- `npx vitest run tests/forum/moderation.test.ts`: 11 passed, 8 todo
- `npx tsc --noEmit`: 0 errors
- `grep -c "pathname.startsWith('/admin')" middleware.ts`: 2
- `supabase/migrations/20260322000001_add_moderation.sql`: exists with all required CREATE TABLE and policies

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 924d859 | test(06-01): add Wave 0 moderation test stubs for MOD-01, MOD-02, MOD-03 |
| 2 | 0439eb9 | chore(06-01): add moderation DB migration — content_reports table, RLS, admin update policies |
| 3 | d8a31d0 | feat(06-01): extend middleware with admin route guard |

## Wave 7 Manual Steps Added

- Apply migration: `supabase/migrations/20260322000001_add_moderation.sql` via Supabase SQL Editor
- Set `is_admin = true` on own user_profiles row via Supabase SQL Editor (solo operator pattern)

## Self-Check: PASSED

- FOUND: tests/forum/moderation.test.ts
- FOUND: supabase/migrations/20260322000001_add_moderation.sql
- FOUND: middleware.ts
- FOUND: commit 924d859
- FOUND: commit 0439eb9
- FOUND: commit d8a31d0
