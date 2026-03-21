---
phase: 05-user-profiles
plan: "01"
subsystem: user-profiles
tags: [test-stubs, storage, migration, middleware, auth-guard]
dependency_graph:
  requires: []
  provides:
    - Wave 0 test stubs for PROF-01, PROF-02, PROF-03
    - avatars Storage bucket SQL migration with RLS policies
    - username backfill migration for existing NULL rows
    - middleware auth guard extended to /settings routes
  affects:
    - tests/profile/profile.test.ts
    - supabase/migrations/20260322000000_add_profile_storage.sql
    - middleware.ts
tech_stack:
  added: []
  patterns:
    - Vitest it.todo stubs for wave-gated test scaffold
    - Supabase Storage RLS using storage.foldername(name)[1] = auth.uid()
    - Username auto-generation via email prefix + gen_random_uuid() suffix
key_files:
  created:
    - tests/profile/profile.test.ts
    - supabase/migrations/20260322000000_add_profile_storage.sql
  modified:
    - middleware.ts
decisions:
  - "PROF test stubs use pure function inline definitions (no lib/ imports) since profile data layer doesn't exist until Plan 02"
  - "Username backfill uses LOWER(REGEXP_REPLACE(email_prefix + '_' + uuid_6chars)) to guarantee uniqueness and valid identifier format"
  - "avatars bucket created as public=true so avatar URLs can be used directly in <img> tags without signed URLs"
metrics:
  duration: "1m 28s"
  completed_date: "2026-03-21"
  tasks_completed: 3
  files_changed: 3
requirements_satisfied:
  - PROF-01
  - PROF-02
  - PROF-03
---

# Phase 5 Plan 01: Foundation — Test Stubs, Storage Migration, Middleware Summary

**One-liner:** Wave 0 test scaffold (3 live Vitest tests + 10 todos), avatars Storage bucket with RLS, username backfill migration, and /settings auth guard in middleware.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create Wave 0 test stubs for PROF-01, PROF-02, PROF-03 | 1e5646a | tests/profile/profile.test.ts |
| 2 | DB migration — Storage bucket, username backfill, trigger update | 6573d49 | supabase/migrations/20260322000000_add_profile_storage.sql |
| 3 | Extend middleware auth guard to cover /settings routes | 6a5b9b4 | middleware.ts |

## Verification Results

- `npx vitest run tests/profile/`: 3 passed, 10 todo (all assertions pass, no failures)
- `npx tsc --noEmit`: 0 errors
- `grep -c "pathname.startsWith('/settings')" middleware.ts`: 2 (both auth blocks updated)

## Decisions Made

1. **Pure function inline tests:** PROF-02 allowlist and PROF-03 bio truncation live tests define their pure functions directly in the test file rather than importing from lib/. The profile data layer (lib/profile/) doesn't exist until Plan 02 — this avoids broken imports.

2. **Username generation pattern:** `LOWER(REGEXP_REPLACE(email_prefix + '_' + uuid_6chars, '[^a-z0-9_]', '_', 'g'))` — handles special chars in email usernames, appends 6 uuid chars for uniqueness guarantee. Used in both the backfill UPDATE and the trigger function.

3. **avatars bucket public=true:** Avatar images are public by design — profile pages display them without auth. Public bucket means standard URLs work in `<img>` tags without generating signed URLs server-side.

## Deviations from Plan

None — plan executed exactly as written.

## Notes

The migration file `20260322000000_add_profile_storage.sql` is version-controlled but must be manually applied via Supabase SQL Editor. This is a Wave 7 manual step (same as the forum migration). The test stubs are Wave 0 scaffolding — live implementations will be added in Plans 02-04 as the data layer and UI are built.

## Self-Check: PASSED

- tests/profile/profile.test.ts: FOUND
- supabase/migrations/20260322000000_add_profile_storage.sql: FOUND
- middleware.ts (modified): FOUND
- Commit 1e5646a: FOUND
- Commit 6573d49: FOUND
- Commit 6a5b9b4: FOUND
