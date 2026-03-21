---
phase: 05-user-profiles
plan: "02"
subsystem: user-profiles
tags: [data-layer, typescript, supabase, server-actions, queries]
dependency_graph:
  requires:
    - 05-01 (test stubs, storage migration, middleware)
  provides:
    - UserProfile, ProfileThread, ProfilePost, ProfileActivity interfaces
    - getProfile, getProfilePostHistory, getProfilesByIds query functions
    - updateProfile, updateAvatarUrl, removeAvatar Server Actions
  affects:
    - lib/profile/types.ts
    - lib/profile/queries.ts
    - lib/profile/actions.ts
    - tests/profile/profile.test.ts (existing stubs still pass)
tech_stack:
  added: []
  patterns:
    - Discriminated union (kind field) for ProfileThread/ProfilePost
    - PGRST116 error code guard for null-safe single() query
    - Parallel Promise.all() queries merged in JS (no PostgREST UNION)
    - VALID_CREDENTIALS as single source of truth for allowlist (types.ts)
    - Server Actions use supabase.auth.getUser() for identity — never formData
key_files:
  created:
    - lib/profile/types.ts
    - lib/profile/queries.ts
    - lib/profile/actions.ts
  modified: []
decisions:
  - "PGRST116 error code checked before general error throw in getProfile — cleanly returns null for missing profiles without crashing"
  - "getProfilePostHistory uses parallel Promise.all for threads+posts then JS merge+sort — PostgREST has no UNION support"
  - "VALID_CREDENTIALS exported from types.ts so both actions.ts (allowlist guard) and future CredentialSelect component import from one source"
  - "removeAvatar exported as third Server Action to support avatar deletion flow — Storage cleanup handled client-side"
metrics:
  duration: "1m 18s"
  completed_date: "2026-03-21"
  tasks_completed: 2
  files_changed: 3
requirements_satisfied:
  - PROF-01
  - PROF-02
  - PROF-03
---

# Phase 5 Plan 02: Profile Data Layer Summary

**One-liner:** TypeScript interfaces (UserProfile, ProfileActivity discriminated union) + Supabase queries (getProfile, paginated post history, batch by IDs) + three auth-guarded Server Actions using auth.getUser() for identity.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Define profile TypeScript interfaces | b4c7882 | lib/profile/types.ts |
| 2 | Implement profile queries and Server Actions | 5e51bfa | lib/profile/queries.ts, lib/profile/actions.ts |

## Verification Results

- `npx tsc --noEmit`: 0 errors (exit 0)
- `npx vitest run tests/profile/`: 3 passed, 10 todo (all assertions pass)
- `grep -n "export const VALID_CREDENTIALS" lib/profile/types.ts`: line 1 match
- `grep -n "export interface UserProfile" lib/profile/types.ts`: line 7 match
- `grep -n "export type ProfileActivity" lib/profile/types.ts`: line 40 match
- `grep -n "export async function getProfile" lib/profile/queries.ts`: line 7 match
- `grep -c "auth.getUser()" lib/profile/actions.ts`: 4 (3 calls + 1 in comment)
- `grep "formData.get('user_id')" lib/profile/actions.ts`: empty (anti-pattern absent)

## Decisions Made

1. **PGRST116 null guard:** `getProfile` checks `error?.code === 'PGRST116'` before the general error throw — this is PostgREST's "no rows found" code for `.single()`. Returns null cleanly without throwing.

2. **Parallel fetch + JS merge for post history:** `getProfilePostHistory` runs two parallel queries (forum_threads, forum_posts) via `Promise.all`, then merges and re-sorts by `created_at` descending in JavaScript. PostgREST has no UNION support, so this is the correct pattern.

3. **VALID_CREDENTIALS as single source:** Exported from `types.ts` so both the Server Action allowlist guard and future UI components (CredentialSelect dropdown) import from one authoritative location.

4. **removeAvatar as third action:** Not in the must_haves truths but specified in the plan's action block. Exported to support the avatar deletion flow — Storage object cleanup is handled client-side before this action sets `avatar_url: null`.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- lib/profile/types.ts: FOUND
- lib/profile/queries.ts: FOUND
- lib/profile/actions.ts: FOUND
- Commit b4c7882: FOUND
- Commit 5e51bfa: FOUND
